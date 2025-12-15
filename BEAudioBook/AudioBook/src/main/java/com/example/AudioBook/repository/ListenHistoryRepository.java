package com.example.AudioBook.repository;

import com.example.AudioBook.entity.ListenHistory;
import com.example.AudioBook.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListenHistoryRepository extends JpaRepository<ListenHistory,Long> {
    List<ListenHistory> findAllByUser(User user);
    Page<ListenHistory> findAllByUser(User user, Pageable pageable);
}
