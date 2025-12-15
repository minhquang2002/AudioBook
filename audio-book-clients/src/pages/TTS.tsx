import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { myAudioApi, ttsApi, historyApi } from '@/lib/api';
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
import { Mic, Play, Pause, Download, Save, Loader2, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TTS = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Array<{ id: number; audio_name: string; audio_url: string }>>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [speed, setSpeed] = useState([1]);
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

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập văn bản để chuyển đổi',
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

    setIsGenerating(true);
    
    try {
      const result = await ttsApi.generate(text, selectedVoice);
      setAudioUrl(result.audio_file_url);
      
      // Add to history
      if (user) {
        await historyApi.add({
          username: user.username,
          titleOfBook: 'Text to Speech',
          titleOfChapter: 'Text to Speech',
          audioUrl: result.audio_file_url,
          nameOfAudio: selectedVoiceName,
          time: new Date().toLocaleString('vi-VN'),
        });
      }

      toast({
        title: 'Thành công',
        description: 'Audio đã được tạo thành công!',
      });
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo audio. Vui lòng kiểm tra server TTS (http://localhost:5000)',
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'tts-audio.mp3';
      a.click();
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">
                Bạn cần đăng nhập để sử dụng tính năng Text to Speech
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Mic className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              Text to Speech
            </h1>
            <p className="mt-2 text-muted-foreground">
              Chuyển đổi văn bản thành giọng nói chất lượng cao
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nhập văn bản</CardTitle>
                  <CardDescription>
                    Nhập hoặc dán văn bản bạn muốn chuyển đổi thành giọng nói
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Nhập văn bản tại đây... (tối đa 5000 ký tự)"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 5000))}
                    className="min-h-[250px] resize-none"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{wordCount} từ</span>
                    <span>{charCount}/5000 ký tự</span>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !text.trim()}
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

              {/* Output Section */}
              {audioUrl && (
                <Card className="mt-6 animate-fade-in">
                  <CardHeader>
                    <CardTitle>Audio đã tạo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4 py-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={skipBackward}
                        disabled={!audioElement}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        className="h-12 w-12"
                        onClick={togglePlayPause}
                        disabled={!audioElement}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
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

                    {/* Time Display */}
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => {
                          if (audioElement) {
                            audioElement.currentTime = parseFloat(e.target.value);
                          }
                        }}
                        className="w-full"
                      />
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
                  <div className="space-y-2">
                    <Label>Chọn giọng đọc</Label>
                    <Select 
                      value={selectedVoice} 
                      onValueChange={(value) => {
                        setSelectedVoice(value);
                        const voice = voices.find(v => v.audio_url === value);
                        if (voice) setSelectedVoiceName(voice.audio_name);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giọng đọc" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.audio_url}>
                            {voice.audio_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tốc độ đọc</Label>
                      <span className="text-sm text-muted-foreground">{speed[0]}x</span>
                    </div>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={0.5}
                      max={2}
                      step={0.25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-medium">Lưu ý</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Tối đa 5000 ký tự mỗi lần</li>
                      <li>• Hỗ trợ tiếng Việt</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TTS;
