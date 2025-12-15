package com.example.AudioBook.repository;

import com.example.AudioBook.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book,Long> {
    List<Book> findByCategoryId(Long id);

    List<Book> findByTitleContaining(String keyword);
    
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Book> findByTitleOrAuthorContaining(@Param("keyword") String keyword);
}
