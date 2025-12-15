import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Mic, Play, Pause, Download, Loader2 } from "lucide-react";

const voices = [
  { id: "vi-VN-HoaiMyNeural", name: "Hoài My (Nữ)" },
  { id: "vi-VN-NamMinhNeural", name: "Nam Minh (Nam)" },
  { id: "alloy", name: "Alloy (English)" },
  { id: "echo", name: "Echo (English)" },
  { id: "fable", name: "Fable (English)" },
  { id: "onyx", name: "Onyx (English)" },
  { id: "nova", name: "Nova (English)" },
  { id: "shimmer", name: "Shimmer (English)" },
];

const AudioGeneration = () => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [speed, setSpeed] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập văn bản cần chuyển đổi",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate audio generation - In production, this would call your TTS API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // For demo purposes, create a simple audio blob
      // In production, replace with actual TTS API call
      toast({
        title: "Thông báo",
        description: "Tính năng TTS đang được phát triển. Vui lòng tích hợp API TTS.",
      });
      
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo audio",
        variant: "destructive",
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

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "generated-audio.mp3";
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Sinh Audio (Text-to-Speech)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>Văn bản cần chuyển đổi</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập văn bản cần chuyển thành audio..."
                rows={8}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {text.length} ký tự
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Giọng đọc</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tốc độ đọc: {speed[0].toFixed(1)}x</Label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo audio...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Tạo Audio
                </>
              )}
            </Button>

            {audioUrl && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audio đã tạo</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="font-medium text-foreground">Hướng dẫn sử dụng</h4>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Nhập văn bản bạn muốn chuyển thành audio</li>
            <li>• Chọn giọng đọc phù hợp (tiếng Việt hoặc tiếng Anh)</li>
            <li>• Điều chỉnh tốc độ đọc theo ý muốn</li>
            <li>• Nhấn "Tạo Audio" để bắt đầu sinh audio</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioGeneration;
