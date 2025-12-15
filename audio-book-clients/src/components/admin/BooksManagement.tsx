import { useEffect, useState } from "react";
import { booksApi, categoriesApi, Book, Category, uploadApi, chaptersApi, audioApi, BookDetail } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit, Trash2, Search, Upload, X, List, Play, Pause } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChapterFormData {
  name: string;
  content: string;
  audioFile: File | null;
  voice: string;
}

interface BookFormData {
  title: string;
  author: string;
  publishDate: string;
  categoryId: number | null;
  description: string;
  imageUrl: string;
  coverFile: File | null;
  chapters: ChapterFormData[];
}

const emptyChapter: ChapterFormData = {
  name: "",
  content: "",
  audioFile: null,
  voice: "",
};

const initialFormData: BookFormData = {
  title: "",
  author: "",
  publishDate: "",
  categoryId: null,
  description: "",
  imageUrl: "",
  coverFile: null,
  chapters: [{ ...emptyChapter }],
};

interface BookFormProps {
  isEdit?: boolean;
  formData: BookFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookFormData>>;
  categories: Category[];
  handleCoverFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateChapter: (index: number, field: keyof ChapterFormData, value: string | File | null) => void;
  updateChapterAudio: (index: number, file: File | null) => void;
  addChapter: () => void;
  removeChapter: (index: number) => void;
  handleAddBook: () => void;
  handleEditBook: () => void;
  isSubmitting: boolean;
}

const BookForm = ({
  isEdit = false,
  formData,
  setFormData,
  categories,
  handleCoverFileChange,
  updateChapter,
  updateChapterAudio,
  addChapter,
  removeChapter,
  handleAddBook,
  handleEditBook,
  isSubmitting,
}: BookFormProps) => (
  <ScrollArea className="max-h-[70vh] pr-4">
    <div className="space-y-6">
      {/* Book Cover Preview - Only show in Edit mode */}
      {isEdit && formData.imageUrl && (
        <div className="flex justify-center">
          <div className="relative group">
            <img
              src={formData.imageUrl}
              alt="Book cover"
              className="w-48 h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
                <Button type="button" variant="secondary" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Thay đổi ảnh
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Thông tin cơ bản
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tên sách <span className="text-destructive">*</span></Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tên sách..."
            />
          </div>
          <div className="space-y-2">
            <Label>Tác giả <span className="text-destructive">*</span></Label>
            <Input
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Nhập tên tác giả..."
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Ngày xuất bản</Label>
            <Input
              type="date"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Thể loại</Label>
            <Select
              value={formData.categoryId?.toString() || ""}
              onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn Thể loại" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Hình ảnh bìa</Label>
          {!isEdit && (
            <div className="flex gap-2">
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="URL ảnh bìa hoặc tải lên..."
                className="flex-1"
              />
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Tải lên
                  </span>
                </Button>
              </label>
            </div>
          )}
          {isEdit && (
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="URL ảnh bìa..."
            />
          )}
          {formData.coverFile && (
            <p className="text-sm text-muted-foreground">
              Đã chọn file mới: {formData.coverFile.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả sách..."
            rows={3}
          />
        </div>
      </div>

      {/* Chapters Section - Only show for Add */}
      {!isEdit && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Các phần / Chapter
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addChapter}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm phần
              </Button>
            </div>

            {formData.chapters.map((chapter, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Phần {index + 1}</h4>
                    {formData.chapters.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeChapter(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tên phần</Label>
                    <Input
                      value={chapter.name}
                      onChange={(e) => updateChapter(index, "name", e.target.value)}
                      placeholder="VD: Chương 1 - Khởi đầu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Giọng đọc</Label>
                    <Input
                      value={chapter.voice}
                      onChange={(e) => updateChapter(index, "voice", e.target.value)}
                      placeholder="VD: Giọng nam miền Bắc, Giọng nữ miền Nam..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>File audio</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateChapterAudio(index, file);
                          }
                        }}
                        className="flex-1"
                      />
                      {chapter.audioFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateChapterAudio(index, null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {chapter.audioFile && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn: {chapter.audioFile.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Nội dung (tùy chọn)</Label>
                    <Textarea
                      value={chapter.content}
                      onChange={(e) => updateChapter(index, "content", e.target.value)}
                      placeholder="Nhập nội dung phần này..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nội dung text của chapter (không bắt buộc)
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Button
        onClick={isEdit ? handleEditBook : handleAddBook}
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Đang xử lý...
          </>
        ) : isEdit ? (
          "Lưu thay đổi"
        ) : (
          "Thêm sách"
        )}
      </Button>
    </div>
  </ScrollArea>
);

const BooksManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChaptersDialogOpen, setIsChaptersDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<BookDetail | null>(null);
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapterFormData, setChapterFormData] = useState({ name: "", content: "", audioFile: null as File | null, voice: "" });
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [currentChapterAudios, setCurrentChapterAudios] = useState<any[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [audioElement] = useState(new Audio());
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        booksApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Cleanup audio on unmount
    return () => {
      audioElement.pause();
    };
  }, []);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, coverFile: file, imageUrl: previewUrl });
    }
  };

  const updateChapter = (index: number, field: keyof ChapterFormData, value: string | File | null) => {
    const newChapters = [...formData.chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setFormData({ ...formData, chapters: newChapters });
  };

  const updateChapterAudio = (index: number, file: File | null) => {
    const newChapters = [...formData.chapters];
    newChapters[index] = { ...newChapters[index], audioFile: file };
    setFormData({ ...formData, chapters: newChapters });
  };

  const addChapter = () => {
    setFormData({
      ...formData,
      chapters: [...formData.chapters, { ...emptyChapter }],
    });
  };

  const removeChapter = (index: number) => {
    if (formData.chapters.length > 1) {
      const newChapters = formData.chapters.filter((_, i) => i !== index);
      setFormData({ ...formData, chapters: newChapters });
    }
  };

  const handleAddBook = async () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload cover image if file is selected
      let coverUrl = formData.imageUrl;
      if (formData.coverFile) {
        coverUrl = await uploadApi.uploadFile(formData.coverFile);
      }

      // Add book first
      await booksApi.add({
        title: formData.title,
        author: formData.author,
        categoryId: formData.categoryId || 0,
        description: formData.description,
        image: coverUrl,
        published: formData.publishDate || undefined,
      });

      // Get the newly created book to get its ID
      const allBooks = await booksApi.getAll();
      const newBook = allBooks.find(b => b.title === formData.title && b.author === formData.author);

      // Add chapters with audio files if book was created
      if (newBook) {
        for (let i = 0; i < formData.chapters.length; i++) {
          const chapter = formData.chapters[i];
          if (chapter.name.trim()) {
            // Add chapter
            await chaptersApi.add({
              book_id: newBook.id,
              chapter_title: chapter.name,
              text: chapter.content,
            });

            // Get the newly created chapter to get its ID
            const bookWithChapters = await booksApi.getById(newBook.id);
            const newChapter = bookWithChapters.chapters?.find(c => c.title_chapter === chapter.name);

            // Upload and add audio if provided
            if (newChapter && chapter.audioFile) {
              const audioUrl = await uploadApi.uploadFile(chapter.audioFile);
              const audioName = chapter.voice || chapter.audioFile.name;
              
              await audioApi.add({
                chapter_id: newChapter.id,
                audio_name: audioName,
                audio_file: audioUrl,
              });
            }
          }
        }
      }

      toast({
        title: "Thành công",
        description: "Thêm sách thành công",
      });
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm sách",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBook = async () => {
    if (!editingBook) return;

    try {
      setIsSubmitting(true);

      let coverUrl = formData.imageUrl;
      if (formData.coverFile) {
        coverUrl = await uploadApi.uploadFile(formData.coverFile);
      }

      // Prepare update data matching backend expectations
      const updateData: any = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        image: coverUrl,
      };

      // Add published date if provided
      if (formData.publishDate) {
        updateData.published = formData.publishDate;
      }

      // Add categoryId if selected
      if (formData.categoryId) {
        updateData.categoryId = formData.categoryId;
      }

      await booksApi.update(editingBook.id, updateData);
      toast({
        title: "Thành công",
        description: "Cập nhật sách thành công",
      });
      setIsEditDialogOpen(false);
      setEditingBook(null);
      loadData();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật sách. Vui lòng kiểm tra lại thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await booksApi.delete(id);
      toast({
        title: "Thành công",
        description: "Xóa sách thành công",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa sách",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    // Find category ID by category name
    const categoryId = categories.find(c => c.name === book.category)?.id || null;
    setFormData({
      title: book.title,
      author: book.author,
      publishDate: book.published || "",
      categoryId: categoryId,
      description: book.description || "",
      imageUrl: book.image || "",
      coverFile: null,
      chapters: [{ ...emptyChapter }],
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const openChaptersDialog = async (book: Book) => {
    try {
      const bookDetail = await booksApi.getById(book.id);
      setSelectedBookForChapters(bookDetail);
      setIsChaptersDialogOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chapters",
        variant: "destructive",
      });
    }
  };

  const handleAddChapter = async () => {
    if (!selectedBookForChapters || !chapterFormData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên chapter",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await chaptersApi.add({
        book_id: selectedBookForChapters.id,
        chapter_title: chapterFormData.name,
        text: chapterFormData.content,
      });

      // Reload chapters
      const updatedBook = await booksApi.getById(selectedBookForChapters.id);
      const newChapter = updatedBook.chapters?.find(c => c.title_chapter === chapterFormData.name);

      // Upload audio if provided
      if (newChapter && chapterFormData.audioFile) {
        const audioUrl = await uploadApi.uploadFile(chapterFormData.audioFile);
        await audioApi.add({
          chapter_id: newChapter.id,
          audio_name: chapterFormData.voice || chapterFormData.audioFile.name,
          audio_file: audioUrl,
        });
      }

      setSelectedBookForChapters(await booksApi.getById(selectedBookForChapters.id));
      setChapterFormData({ name: "", content: "", audioFile: null, voice: "" });
      toast({
        title: "Thành công",
        description: "Thêm chapter thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm chapter",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateChapter = async (chapterId: number) => {
    if (!chapterFormData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên chapter",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await chaptersApi.update(chapterId, {
        chapter_title: chapterFormData.name,
        text: chapterFormData.content,
      });

      // Upload new audio if provided
      if (chapterFormData.audioFile) {
        const audioUrl = await uploadApi.uploadFile(chapterFormData.audioFile);
        await audioApi.add({
          chapter_id: chapterId,
          audio_name: chapterFormData.voice || chapterFormData.audioFile.name,
          audio_file: audioUrl,
        });
      }

      if (selectedBookForChapters) {
        setSelectedBookForChapters(await booksApi.getById(selectedBookForChapters.id));
      }
      setEditingChapterId(null);
      setChapterFormData({ name: "", content: "", audioFile: null, voice: "" });
      setCurrentChapterAudios([]);
      toast({
        title: "Thành công",
        description: "Cập nhật chapter thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chapter",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    try {
      await chaptersApi.delete(chapterId);
      if (selectedBookForChapters) {
        setSelectedBookForChapters(await booksApi.getById(selectedBookForChapters.id));
      }
      toast({
        title: "Thành công",
        description: "Xóa chapter thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa chapter",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAudio = async (audioId: number) => {
    try {
      await audioApi.delete(audioId);
      if (selectedBookForChapters) {
        const updatedBook = await booksApi.getById(selectedBookForChapters.id);
        setSelectedBookForChapters(updatedBook);
        
        // Update current chapter audios if editing
        if (editingChapterId) {
          const chapter = updatedBook.chapters?.find(c => c.id === editingChapterId);
          setCurrentChapterAudios(chapter?.audioes || []);
        }
      }
      toast({
        title: "Thành công",
        description: "Xóa audio thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa audio",
        variant: "destructive",
      });
    }
  };

  const togglePlayAudio = (audioId: number, audioUrl: string) => {
    if (playingAudioId === audioId) {
      audioElement.pause();
      setPlayingAudioId(null);
    } else {
      audioElement.src = audioUrl;
      audioElement.play();
      setPlayingAudioId(audioId);
      
      // Auto stop when finished
      audioElement.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryName?: string) => {
    if (!categoryName) return "-";
    return categoryName;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Quản lý sách
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sách
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm sách mới</DialogTitle>
            </DialogHeader>
            <BookForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              handleCoverFileChange={handleCoverFileChange}
              updateChapter={updateChapter}
              updateChapterAudio={updateChapterAudio}
              addChapter={addChapter}
              removeChapter={removeChapter}
              handleAddBook={handleAddBook}
              handleEditBook={handleEditBook}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên sách</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Thể loại</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book, index) => (
                  <TableRow key={book.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{getCategoryName(book.category)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openChaptersDialog(book)} title="Quản lý chapters">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(book)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
                                Bạn có chắc chắn muốn xóa sách "{book.title}"? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBook(book.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sách</DialogTitle>
            </DialogHeader>
            <BookForm
              isEdit
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              handleCoverFileChange={handleCoverFileChange}
              updateChapter={updateChapter}
              updateChapterAudio={updateChapterAudio}
              addChapter={addChapter}
              removeChapter={removeChapter}
              handleAddBook={handleAddBook}
              handleEditBook={handleEditBook}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Chapters Management Dialog */}
        <Dialog open={isChaptersDialogOpen} onOpenChange={setIsChaptersDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Quản lý Chapters - {selectedBookForChapters?.title}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Add/Edit Chapter Form */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">
                    {editingChapterId ? "Sửa Chapter" : "Thêm Chapter Mới"}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tên chapter <span className="text-destructive">*</span></Label>
                      <Input
                        value={chapterFormData.name}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, name: e.target.value })}
                        placeholder="Nhập tên chapter..."
                      />
                    </div>

                    {/* Current Audios - only show when editing */}
                    {editingChapterId && currentChapterAudios.length > 0 && (
                      <div className="space-y-2">
                        <Label>Audio hiện tại</Label>
                        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                          {currentChapterAudios.map((audio) => (
                            <div key={audio.id} className="flex items-center justify-between bg-background p-2 rounded">
                              <span className="text-sm flex-1">{audio.audio_name}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => togglePlayAudio(audio.id, audio.audio_file)}
                                >
                                  {playingAudioId === audio.id ? (
                                    <Pause className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Play className="h-3 w-3 mr-1" />
                                  )}
                                  {playingAudioId === audio.id ? "Dừng" : "Nghe"}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive h-8">
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Xóa
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận xóa audio</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn xóa audio "{audio.audio_name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteAudio(audio.id)}>
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>{editingChapterId ? "Thêm audio mới" : "File audio"}</Label>
                      <Input
                        value={chapterFormData.voice}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, voice: e.target.value })}
                        placeholder="VD: Giọng nam, Giọng nữ..."
                        className="mb-2"
                      />
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setChapterFormData({ ...chapterFormData, audioFile: file || null });
                        }}
                      />
                      {chapterFormData.audioFile && (
                        <p className="text-sm text-muted-foreground">
                          Đã chọn: {chapterFormData.audioFile.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Nội dung</Label>
                      <Textarea
                        value={chapterFormData.content}
                        onChange={(e) => setChapterFormData({ ...chapterFormData, content: e.target.value })}
                        placeholder="Nhập nội dung chapter..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      {editingChapterId ? (
                        <>
                          <Button
                            onClick={() => handleUpdateChapter(editingChapterId)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingChapterId(null);
                              setChapterFormData({ name: "", content: "", audioFile: null, voice: "" });
                              setCurrentChapterAudios([]);
                            }}
                          >
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleAddChapter} disabled={isSubmitting}>
                          {isSubmitting ? "Đang thêm..." : "Thêm Chapter"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Chapters List */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Danh sách Chapters</h3>
                  {selectedBookForChapters?.chapters && selectedBookForChapters.chapters.length > 0 ? (
                    selectedBookForChapters.chapters.map((chapter, index) => (
                      <Card key={chapter.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {index + 1}. {chapter.title_chapter}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {chapter.text || "Không có nội dung"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingChapterId(chapter.id);
                                  setChapterFormData({
                                    name: chapter.title_chapter,
                                    content: chapter.text || "",
                                    audioFile: null,
                                    voice: "",
                                  });
                                  setCurrentChapterAudios(chapter.audioes || []);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn xóa chapter "{chapter.title_chapter}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteChapter(chapter.id)}>
                                      Xóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {/* Audio List */}
                          {chapter.audioes && chapter.audioes.length > 0 && (
                            <div className="ml-4 space-y-2">
                              <p className="text-sm font-medium">Audio files:</p>
                              {chapter.audioes.map((audio) => (
                                <div key={audio.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                  <span className="text-sm flex-1">{audio.audio_name}</span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8"
                                      onClick={() => togglePlayAudio(audio.id, audio.audio_file)}
                                    >
                                      {playingAudioId === audio.id ? (
                                        <Pause className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Play className="h-3 w-3 mr-1" />
                                      )}
                                      {playingAudioId === audio.id ? "Dừng" : "Nghe"}
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="text-destructive h-8">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Xác nhận xóa audio</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bạn có chắc chắn muốn xóa audio "{audio.audio_name}"?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteAudio(audio.id)}>
                                            Xóa
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Chưa có chapter nào. Thêm chapter mới ở trên.
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BooksManagement;
