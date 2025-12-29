import { useEffect, useState } from "react";
import { categoriesApi, Category } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách Thể loại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập Thể loại",
        variant: "destructive",
      });
      return;
    }

    try {
      await categoriesApi.add(newCategoryName);
      toast({
        title: "Thành công",
        description: "Thêm Thể loại thành công",
      });
      setNewCategoryName("");
      setIsAddDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm Thể loại",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập Thể loại",
        variant: "destructive",
      });
      return;
    }

    if (!editingCategory) return;

    try {
      await categoriesApi.update(editingCategory.id, editCategoryName);
      toast({
        title: "Thành công",
        description: "Cập nhật Thể loại thành công",
      });
      setEditCategoryName("");
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      loadCategories();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật Thể loại",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await categoriesApi.delete(deletingCategory.id);
      toast({
        title: "Thành công",
        description: "Xóa Thể loại thành công",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
      loadCategories();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa Thể loại",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Quản lý Thể loại
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Thể loại
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Thể loại mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Thể loại</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập Thể loại..."
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Thêm Thể loại
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Số sách</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {category.books || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditCategoryName(category.name);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setDeletingCategory(category);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Danh mục</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên Danh mục</Label>
                <Input
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Nhập Danh mục..."
                />
              </div>
              <Button onClick={handleUpdateCategory} className="w-full">
                Lưu thay đổi
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa Thể loại</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa thể loại <span className="font-semibold">{deletingCategory?.name}</span> không?
                <br />
                <span className="text-destructive font-semibold">Cảnh báo: Tất cả sách và nội dung liên quan đến thể loại này sẽ bị xóa vĩnh viễn!</span>
                <br />
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CategoriesManagement;
