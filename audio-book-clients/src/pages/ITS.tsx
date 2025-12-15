import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { uploadApi, ocrApi, myAudioApi, ttsApi, historyApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Image, Upload, Play, Pause, Download, Save, Loader2, Volume2, X, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITS = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [voices, setVoices] = useState<Array<{ id: number; audio_name: string; audio_url: string }>>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [speed, setSpeed] = useState([1]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadVoices();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed[0];
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);

      return () => {
        audio.pause();
        audio.remove();
      };
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioElement) {
      audioElement.playbackRate = speed[0];
    }
  }, [speed, audioElement]);

  const loadVoices = async () => {
    if (!user) return;
    try {
      const data = await myAudioApi.getByUser(user.username);
      setVoices(data);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn file hình ảnh (JPG, PNG)',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    setExtractedText('');
    setAudioUrl(null);
  };

  const handleExtractText = async () => {
    if (!imageFile) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn hình ảnh trước',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    try {
      // Upload image to Cloudinary
      const uploadedUrl = await uploadApi.uploadFile(imageFile);

      // Call OCR API
      const ocrResult = await ocrApi.getText(uploadedUrl);
      
      setExtractedText(ocrResult.text_from_image);
      toast({
        title: 'Thành công',
        description: 'Đã trích xuất văn bản từ hình ảnh',
      });
    } catch (error) {
      console.error('OCR extraction error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể trích xuất văn bản. Vui lòng kiểm tra server OCR.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!extractedText.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Không có văn bản để chuyển đổi',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVoice) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn giọng đọc',
        variant: 'destructive',
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để sử dụng tính năng này',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await ttsApi.generate(extractedText, selectedVoice);
      setAudioUrl(result.audio_file_url);

      // Save to history
      if (user) {
        await historyApi.add({
          username: user.username,
          titleOfBook: 'ITS Generated',
          titleOfChapter: selectedVoiceName,
          audioUrl: result.audio_file_url,
          nameOfAudio: `ITS - ${selectedVoiceName}`,
          time: new Date().toISOString(),
        });
      }

      toast({
        title: 'Thành công',
        description: result.message || 'Audio đã được tạo thành công!',
      });
    } catch (error) {
      console.error('TTS generation error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo audio. Vui lòng kiểm tra server TTS.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipBackward = () => {
    if (audioElement) {
      audioElement.currentTime = Math.max(0, audioElement.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioElement) {
      audioElement.currentTime = Math.min(duration, audioElement.currentTime + 10);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioElement) {
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `its-${selectedVoiceName}-${Date.now()}.mp3`;
      a.click();
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <Image className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              Image to Speech
            </h1>
            <p className="mt-2 text-muted-foreground">
              Trích xuất văn bản từ hình ảnh và chuyển đổi thành giọng nói
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Tải lên hình ảnh</CardTitle>
                  <CardDescription>
                    Kéo thả hoặc chọn file hình ảnh chứa văn bản (JPG, PNG)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!image ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50"
                    >
                      <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-center text-muted-foreground">
                        Kéo thả hình ảnh vào đây
                        <br />
                        <span className="text-sm">hoặc click để chọn file</span>
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={image}
                        alt="Uploaded"
                        className="max-h-[300px] w-full rounded-lg object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {isExtracting && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span>Đang trích xuất văn bản...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracted Text */}
              {extractedText && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Văn bản trích xuất</CardTitle>
                    <CardDescription>
                      Bạn có thể chỉnh sửa văn bản trước khi chuyển đổi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !extractedText.trim()}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Đang tạo audio...
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-5 w-5" />
                          Tạo Audio
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Output Section */}
              {audioUrl && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Audio đã tạo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Custom Audio Player */}
                    <div className="space-y-4 rounded-lg border p-4">
                      {/* Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={skipBackward}
                          disabled={!audioElement}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          className="h-12 w-12"
                          onClick={togglePlayPause}
                          disabled={!audioElement}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={skipForward}
                          disabled={!audioElement}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleProgressChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Settings Section */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Cài đặt giọng nói</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isAuthenticated ? (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                      <p className="text-sm text-yellow-600 dark:text-yellow-500">
                        Vui lòng đăng nhập để sử dụng tính năng này
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Chọn giọng đọc</Label>
                        <Select 
                          value={selectedVoice} 
                          onValueChange={(value) => {
                            setSelectedVoice(value);
                            const voice = voices.find(v => v.audio_url === value);
                            setSelectedVoiceName(voice?.audio_name || '');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giọng..." />
                          </SelectTrigger>
                          <SelectContent>
                            {voices.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Không có giọng nào
                              </div>
                            ) : (
                              voices.map((voice) => (
                                <SelectItem key={voice.id} value={voice.audio_url}>
                                  {voice.audio_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Tốc độ đọc</Label>
                          <span className="text-sm text-muted-foreground">{speed[0]}x</span>
                        </div>
                        <Slider
                          value={speed}
                          onValueChange={setSpeed}
                          min={0.5}
                          max={2}
                          step={0.1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>2x</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleExtractText}
                        disabled={!image || isExtracting}
                        className="w-full"
                        variant="outline"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang trích xuất...
                          </>
                        ) : (
                          'Trích xuất văn bản'
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ITS;
