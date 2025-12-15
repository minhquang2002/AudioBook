import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { historyApi, ListenHistory as ListenHistoryType } from "@/lib/api";
import { History, Play, Clock, BookOpen, Square, Download, ChevronLeft, ChevronRight } from "lucide-react";

const ListenHistory = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ListenHistoryType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<{ [key: number]: HTMLAudioElement }>({});
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.username) {
      loadHistory(0);
    }
  }, [user]);

  const loadHistory = async (page: number) => {
    if (!user?.username) return;
    
    try {
      setLoadingHistory(true);
      const data = await historyApi.getByUser(user.username, page, itemsPerPage);
      console.log('Listen history data:', data); // Debug log
      
      // Backend now returns paginated data
      setHistory(data.content || []);
      setTotalItems(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistory([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadHistory(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayAudio = (audioUrl: string, itemId: number) => {
    // Stop current audio if playing
    if (playingAudio[itemId]) {
      playingAudio[itemId].pause();
      setIsPlaying(prev => ({ ...prev, [itemId]: false }));
      return;
    }

    // Stop all other audios
    Object.entries(playingAudio).forEach(([id, audio]) => {
      audio.pause();
      setIsPlaying(prev => ({ ...prev, [Number(id)]: false }));
    });

    // Play new audio
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
    });

    audio.onended = () => {
      setIsPlaying(prev => ({ ...prev, [itemId]: false }));
    };

    setPlayingAudio(prev => ({ ...prev, [itemId]: audio }));
    setIsPlaying(prev => ({ ...prev, [itemId]: true }));
  };

  const handleStopAudio = (itemId: number) => {
    if (playingAudio[itemId]) {
      playingAudio[itemId].pause();
      playingAudio[itemId].currentTime = 0;
      setIsPlaying(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDownload = (audioUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${name}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(playingAudio).forEach(audio => {
        audio.pause();
      });
    };
  }, [playingAudio]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Lịch sử nghe</h1>
          <p className="mt-2 text-muted-foreground">
            Xem lại các audiobook bạn đã nghe
          </p>
        </div>

        {loadingHistory ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <History className="mb-4 h-16 w-16 text-muted-foreground" />
              <CardTitle className="mb-2">Chưa có lịch sử nghe</CardTitle>
              <CardDescription className="mb-4">
                Bắt đầu khám phá và nghe audiobook ngay
              </CardDescription>
              <Button asChild>
                <Link to="/books">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Khám phá sách
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <Card key={item.id || index} className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <History className="h-12 w-12 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="text-lg font-semibold text-foreground">
                        {item.titleOfBook || 'Không có tiêu đề'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.titleOfChapter || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.nameOfAudio || 'N/A'}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.time ? formatDate(item.time) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant={isPlaying[item.id || index] ? "default" : "outline"}
                        size="icon"
                        onClick={() => item.audioUrl && handlePlayAudio(item.audioUrl, item.id || index)}
                        disabled={!item.audioUrl}
                      >
                        {isPlaying[item.id || index] ? (
                          <Square className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {isPlaying[item.id || index] && (
                        <Button 
                          variant="destructive"
                          size="icon"
                          onClick={() => handleStopAudio(item.id || index)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => item.audioUrl && handleDownload(item.audioUrl, item.nameOfAudio || 'audio')}
                        disabled={!item.audioUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loadingHistory && history.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <span className="text-xs text-muted-foreground">
                (Tổng {totalItems})
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ListenHistory;
