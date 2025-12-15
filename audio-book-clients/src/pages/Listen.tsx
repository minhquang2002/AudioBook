import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { booksApi, BookDetail, ChapterDetail, myAudioApi, MyAudio, ttsApi, historyApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ArrowLeft,
  List,
  Loader2,
  Mic,
  Sparkles,
  Check
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Listen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [audio] = useState(new Audio());
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Voice selection
  const [audioSource, setAudioSource] = useState<"admin" | "user">("admin");
  const [selectedAdminAudioIndex, setSelectedAdminAudioIndex] = useState(0);
  const [userAudios, setUserAudios] = useState<MyAudio[]>([]);
  const [selectedUserAudioId, setSelectedUserAudioId] = useState<string>("");
  const [loadingUserAudio, setLoadingUserAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>("");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await booksApi.getById(parseInt(id));
        setBook(data);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sách",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id, toast]);

  // Load user audios
  useEffect(() => {
    const loadUserAudios = async () => {
      if (!user?.username) return;
      
      try {
        setLoadingUserAudio(true);
        const data = await myAudioApi.getByUser(user.username);
        setUserAudios(data);
      } catch (error) {
        console.error('Failed to load user audios:', error);
      } finally {
        setLoadingUserAudio(false);
      }
    };

    loadUserAudios();
  }, [user]);

  // Generate audio with user voice when user audio is selected
  const generateAudioWithUserVoice = async (chapter: ChapterDetail, userAudioUrl: string, userAudioName: string) => {
    if (!chapter.text || !userAudioUrl) return;

    setIsGeneratingAudio(true);
    try {
      toast({
        title: "Đang tạo audio",
        description: "Vui lòng đợi trong giây lát...",
      });

      const result = await ttsApi.generate(chapter.text, userAudioUrl);
      setGeneratedAudioUrl(result.audio_file_url);

      // Save to history
      if (user && book) {
        await historyApi.add({
          username: user.username,
          titleOfBook: book.title,
          titleOfChapter: chapter.title_chapter,
          audioUrl: result.audio_file_url,
          nameOfAudio: `${book.title} - ${chapter.title_chapter} (${userAudioName})`,
          time: new Date().toISOString(),
        });
      }

      toast({
        title: "Thành công",
        description: "Audio đã được tạo!",
      });

      return result.audio_file_url;
    } catch (error) {
      console.error('Failed to generate audio:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo audio. Vui lòng kiểm tra server TTS.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      if (book?.chapters && book.chapters.length > 0) {
        const chapter = book.chapters[currentChapterIndex];
        
        // Determine audio source
        let audioUrl = "";
        
        if (audioSource === "admin") {
          // Use admin audio from chapter
          if (chapter?.audioes && chapter.audioes.length > 0) {
            const selectedAudio = chapter.audioes[selectedAdminAudioIndex];
            if (selectedAudio) {
              audioUrl = selectedAudio.audio_file;
            }
          }
        } else if (audioSource === "user") {
          // Use generated audio if available
          if (generatedAudioUrl) {
            audioUrl = generatedAudioUrl;
          }
          // Don't auto-generate, wait for user confirmation
        }
        
        if (audioUrl) {
          audio.src = audioUrl;
          audio.load();
        }
      }
    };

    loadAudio();
  }, [book, currentChapterIndex, audio, audioSource, selectedAdminAudioIndex, selectedUserAudioId, userAudios, generatedAudioUrl]);

  // Reset generated audio when chapter or voice changes
  useEffect(() => {
    setGeneratedAudioUrl("");
  }, [currentChapterIndex, selectedUserAudioId, audioSource]);

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (book?.chapters && currentChapterIndex < book.chapters.length - 1) {
        setCurrentChapterIndex(prev => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio, book, currentChapterIndex]);

  useEffect(() => {
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, audio]);

  useEffect(() => {
    audio.playbackRate = playbackRate;
  }, [playbackRate, audio]);

  useEffect(() => {
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const skipBackward = () => {
    const newTime = Math.max(0, audio.currentTime - 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, audio.currentTime + 10);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const playPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentTime(0);
    }
  };

  const playNextChapter = () => {
    if (book?.chapters && currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentTime(0);
    }
  };

  const selectChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowChapterList(false);
  };

  const handleGenerateAudioClick = async () => {
    if (!book?.chapters) return;
    
    const chapter = book.chapters[currentChapterIndex];
    const userAudio = userAudios.find(a => a.id.toString() === selectedUserAudioId);
    
    if (!chapter.text) {
      toast({
        title: "Lỗi",
        description: "Chương này không có nội dung text để tạo audio",
        variant: "destructive",
      });
      return;
    }
    
    if (!userAudio) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn giọng đọc",
        variant: "destructive",
      });
      return;
    }
    
    const newAudioUrl = await generateAudioWithUserVoice(
      chapter,
      userAudio.audio_url,
      userAudio.audio_name
    );
    
    if (newAudioUrl) {
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Không tìm thấy sách</p>
          <Button onClick={() => navigate("/books")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  const currentChapter = book.chapters?.[currentChapterIndex];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/book/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại chi tiết sách
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Book Cover & Info */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] w-full">
                <img
                  src={book.image || "/placeholder.svg"}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h1 className="text-xl font-bold">{book.title}</h1>
                <p className="text-muted-foreground">{book.author}</p>
              </CardContent>
            </Card>
          </div>

          {/* Player & Chapters */}
          <div className="space-y-6 lg:col-span-2">
            {/* Voice Selection */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Mic className="h-5 w-5 text-primary" />
                Chọn giọng đọc
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nguồn audio</Label>
                  <Select
                    value={audioSource}
                    onValueChange={(value: "admin" | "user") => {
                      setAudioSource(value);
                      setIsPlaying(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Giọng có sẵn</SelectItem>
                      <SelectItem value="user">Sử dụng giọng của bạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {audioSource === "admin" && currentChapter?.audioes && currentChapter.audioes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Chọn giọng</Label>
                    <Select
                      value={selectedAdminAudioIndex.toString()}
                      onValueChange={(value) => {
                        setSelectedAdminAudioIndex(parseInt(value));
                        setIsPlaying(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentChapter.audioes.map((audio, index) => (
                          <SelectItem key={audio.id} value={index.toString()}>
                            {audio.audio_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {audioSource === "user" && (
                  <div className="space-y-2">
                    <Label>Chọn audio của bạn</Label>
                    {loadingUserAudio ? (
                      <div className="flex items-center justify-center h-10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : userAudios.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Bạn chưa có audio nào.{" "}
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => navigate("/my-audio")}
                        >
                          Thêm audio
                        </Button>
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={selectedUserAudioId}
                          onValueChange={(value) => {
                            setSelectedUserAudioId(value);
                            setIsPlaying(false);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn audio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {userAudios.map((audio) => (
                              <SelectItem key={audio.id} value={audio.id.toString()}>
                                {audio.audio_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Generate Audio Button for User Voice */}
                        {selectedUserAudioId && (
                          <Button
                            onClick={handleGenerateAudioClick}
                            disabled={isGeneratingAudio || !!generatedAudioUrl}
                            size="sm"
                            variant={generatedAudioUrl ? "outline" : "default"}
                          >
                            {isGeneratingAudio ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : generatedAudioUrl ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Now Playing */}
            <Card className="p-6">
              <div className="mb-4 text-center">
                <p className="text-sm text-muted-foreground">Đang phát</p>
                <h2 className="text-xl font-semibold">
                  {currentChapter?.title_chapter || "Không có chapter"}
                </h2>
                {audioSource === "user" && !generatedAudioUrl && selectedUserAudioId && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nhấn "Tạo Audio với giọng này" để bắt đầu
                  </p>
                )}
                {isGeneratingAudio && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tạo audio với giọng của bạn...</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6 space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                  disabled={isGeneratingAudio}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute} disabled={isGeneratingAudio}>
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                    disabled={isGeneratingAudio}
                  />
                </div>

                {/* Play Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPreviousChapter}
                    disabled={currentChapterIndex === 0 || isGeneratingAudio}
                    title="Chương trước"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipBackward}
                    title="Tua lùi 10 giây"
                    disabled={isGeneratingAudio}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    className="h-14 w-14 rounded-full"
                    onClick={togglePlay}
                    disabled={isGeneratingAudio || (audioSource === "user" && !generatedAudioUrl)}
                  >
                    {isGeneratingAudio ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipForward}
                    title="Tua tới 10 giây"
                    disabled={isGeneratingAudio}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNextChapter}
                    disabled={!book?.chapters || currentChapterIndex === book.chapters.length - 1 || isGeneratingAudio}
                    title="Chương tiếp theo"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Playback Speed Control */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Tốc độ:</Label>
                  <Select
                    value={playbackRate.toString()}
                    onValueChange={(value) => setPlaybackRate(parseFloat(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="1.75">1.75x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Chapter List */}
            <Card>
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <List className="h-5 w-5" />
                  Danh sách chapter ({book.chapters?.length || 0})
                </h3>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {book.chapters && book.chapters.length > 0 ? (
                    book.chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => selectChapter(index)}
                        className={cn(
                          "w-full rounded-lg p-3 text-left transition-colors hover:bg-muted",
                          currentChapterIndex === index && "bg-primary/10 text-primary"
                        )}
                      >
                        <p className="font-medium">{chapter.title_chapter}</p>
                        {chapter.audioes && chapter.audioes.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {chapter.audioes.length} audio file(s)
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-muted-foreground">
                      Chưa có chapter nào
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Listen;
