import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { myAudioApi, uploadApi } from "@/lib/api";
import { Music, Plus, Play, Pause, Trash2, Upload, Loader2, Mic, Square, Circle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AudioItem {
  id: number;
  audio_name: string;
  audio_url: string;
  username: string;
}

const MyAudio = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAudioName, setNewAudioName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicPermission();
  }, []);

  const checkMicPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
        
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
        };
      }
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  useEffect(() => {
    if (user?.username) {
      loadAudioList();
    }
  }, [user]);

  // Cleanup recording URL on unmount
  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const loadAudioList = async () => {
    if (!user?.username) return;
    
    try {
      setLoadingAudio(true);
      const data = await myAudioApi.getByUser(user.username);
      setAudioList(data);
    } catch (error) {
      console.error("Failed to load audio:", error);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handlePlayPause = (audio: AudioItem) => {
    if (playingId === audio.id) {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      setPlayingId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const newAudio = new Audio(audio.audio_url);
      newAudio.play();
      newAudio.onended = () => {
        setPlayingId(null);
        setAudioElement(null);
      };
      setAudioElement(newAudio);
      setPlayingId(audio.id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await myAudioApi.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa audio",
      });
      loadAudioList();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa audio",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newAudioName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên và chọn file audio",
        variant: "destructive",
      });
      return;
    }

    if (!user?.username) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin người dùng",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting upload...', { selectedFile, newAudioName, username: user.username });
      const audioUrl = await uploadApi.uploadFile(selectedFile);
      console.log('Upload successful, URL:', audioUrl);
      
      await myAudioApi.add({
        audio_name: newAudioName,
        audio_url: audioUrl,
        username: user.username,
      });
      console.log('Audio added successfully');
      
      toast({
        title: "Thành công",
        description: "Đã upload audio",
      });
      resetDialog();
      loadAudioList();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể upload audio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadRecording = async () => {
    if (!recordedBlob || !newAudioName.trim() || !user?.username) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên và ghi âm",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const file = new File([recordedBlob], `${newAudioName}.webm`, { type: "audio/webm" });
      const audioUrl = await uploadApi.uploadFile(file);
      await myAudioApi.add({
        audio_name: newAudioName,
        audio_url: audioUrl,
        username: user.username,
      });
      toast({
        title: "Thành công",
        description: "Đã lưu bản ghi âm",
      });
      resetDialog();
      loadAudioList();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu bản ghi âm",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Không hỗ trợ",
          description: "Trình duyệt không hỗ trợ ghi âm. Vui lòng sử dụng trình duyệt khác.",
          variant: "destructive",
        });
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setMicPermission('granted');

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Đang ghi âm",
        description: "Microphone đã được bật",
      });
    } catch (error) {
      console.error('Recording error:', error);
      let errorMessage = "Không thể truy cập microphone.";
      let errorTitle = "Lỗi";
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicPermission('denied');
          errorTitle = "Quyền bị từ chối";
          errorMessage = "Bạn cần cấp quyền microphone. Nhấn vào biểu tượng khóa/camera bên trái thanh địa chỉ và cho phép microphone.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Microphone đang được sử dụng bởi ứng dụng khác.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
  };

  const resetDialog = () => {
    setIsAddDialogOpen(false);
    setNewAudioName("");
    setSelectedFile(null);
    resetRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Âm thanh của tôi</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            if (!open) resetDialog();
            else setIsAddDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm Audio mới</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="audio_name">Tên Audio</Label>
                  <Input
                    id="audio_name"
                    value={newAudioName}
                    onChange={(e) => setNewAudioName(e.target.value)}
                    placeholder="Nhập tên audio..."
                  />
                </div>

                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="record" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Ghi âm
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label htmlFor="audio_file">File Audio</Label>
                      <Input
                        id="audio_file"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          console.log('File selected:', file); // Debug log
                          setSelectedFile(file || null);
                        }}
                        key={isAddDialogOpen ? 'file-input-open' : 'file-input-closed'}
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Đã chọn: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="record" className="space-y-4">
                    {/* Mic Permission Warning */}
                    {micPermission === 'denied' && (
                      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                        <div className="flex items-start gap-3">
                          <Mic className="h-5 w-5 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-destructive">Quyền microphone bị từ chối</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Nhấn vào biểu tượng khóa/camera bên trái thanh địa chỉ → Cài đặt trang web → Cho phép Microphone
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 p-6">
                      <div className="text-3xl font-mono font-bold text-foreground">
                        {formatTime(recordingTime)}
                      </div>

                      {!recordedBlob ? (
                        <div className="flex flex-col items-center gap-3">
                          {!isRecording ? (
                            <>
                              <Button
                                onClick={startRecording}
                                size="lg"
                                className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90"
                                disabled={micPermission === 'denied'}
                              >
                                <Circle className="h-6 w-6 fill-current" />
                              </Button>
                              <p className="text-sm text-muted-foreground">
                                {micPermission === 'denied' 
                                  ? 'Vui lòng cấp quyền microphone' 
                                  : 'Nhấn để bắt đầu ghi âm'}
                              </p>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={stopRecording}
                                size="lg"
                                variant="outline"
                                className="h-16 w-16 rounded-full border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <Square className="h-6 w-6 fill-current" />
                              </Button>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                Đang ghi âm...
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <audio src={recordedUrl || undefined} controls className="w-full" />
                          <Button variant="outline" size="sm" onClick={resetRecording}>
                            Ghi lại
                          </Button>
                        </div>
                      )}

                      {isRecording && (
                        <p className="flex items-center gap-2 text-sm text-destructive">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                          Đang ghi âm...
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={handleUploadRecording} 
                      disabled={isUploading || !recordedBlob} 
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Lưu bản ghi âm
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loadingAudio ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : audioList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Music className="mb-4 h-16 w-16 text-muted-foreground" />
              <CardTitle className="mb-2">Chưa có audio nào</CardTitle>
              <CardDescription>
                Bắt đầu bằng cách upload hoặc ghi âm audio đầu tiên của bạn
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {audioList.map((audio) => (
              <Card key={audio.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={() => handlePlayPause(audio)}
                      >
                        {playingId === audio.id ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">{audio.audio_name}</h3>
                        <p className="text-sm text-muted-foreground">Audio</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa "{audio.audio_name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(audio.id)}>
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyAudio;
