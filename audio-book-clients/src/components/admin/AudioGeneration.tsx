import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mic, Play, Pause, Download, Loader2, Upload, X } from "lucide-react";
import { ttsApi, uploadApi } from "@/lib/api";

const AudioGeneration = () => {
  const [text, setText] = useState("");
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceFileUrl, setVoiceFileUrl] = useState<string>("");
  const [uploadedVoiceUrl, setUploadedVoiceUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file audio hợp lệ",
          variant: "destructive",
        });
        return;
      }
      
      const localUrl = URL.createObjectURL(file);
      
      // Upload file to server immediately
      setIsUploading(true);
      try {
        const serverUrl = await uploadApi.uploadFile(file);
        setUploadedVoiceUrl(serverUrl);
        setVoiceFile(file);
        setVoiceFileUrl(localUrl);
        toast({
          title: "Thành công",
          description: "Upload file giọng đọc thành công",
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Lỗi",
          description: "Không thể upload file. Vui lòng thử lại.",
          variant: "destructive",
        });
        // Clean up if upload fails
        URL.revokeObjectURL(localUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeVoiceFile = () => {
    if (voiceFileUrl) {
      URL.revokeObjectURL(voiceFileUrl);
    }
    setVoiceFile(null);
    setVoiceFileUrl("");
    setUploadedVoiceUrl("");
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập văn bản cần chuyển đổi",
        variant: "destructive",
      });
      return;
    }

    if (!uploadedVoiceUrl) {
      toast({
        title: "Lỗi",
        description: "Vui lòng upload file giọng đọc mẫu",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Call TTS API with uploaded voice URL
      const result = await ttsApi.generate(text, uploadedVoiceUrl);
      
      setAudioUrl(result.audio_file_url);
      
      // Create audio element
      const audio = new Audio(result.audio_file_url);
      setAudioElement(audio);
      
      toast({
        title: "Thành công",
        description: "Tạo audio thành công!",
      });
      
    } catch (error) {
      console.error('TTS Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo audio. Vui lòng kiểm tra server TTS.",
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
              <Label>File giọng đọc mẫu</Label>
              {!voiceFile ? (
                <div className="mt-2">
                  <label htmlFor="voice-upload" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:bg-muted">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-2 text-sm font-medium text-foreground">
                          Đang upload...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium text-foreground">
                          Click để upload file audio
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          MP3, WAV, hoặc các định dạng audio khác
                        </p>
                      </>
                    )}
                    <Input
                      id="voice-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{voiceFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(voiceFile.size / 1024 / 1024).toFixed(2)} MB • Đã upload
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeVoiceFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim() || !uploadedVoiceUrl || isUploading}
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
            <li>• Upload file audio mẫu chứa giọng đọc bạn muốn clone</li>
            <li>• Nhấn "Tạo Audio" để bắt đầu sinh audio với giọng đọc đã upload</li>
            <li>• File giọng đọc mẫu nên có chất lượng tốt, rõ ràng và không có nhiễu</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioGeneration;
