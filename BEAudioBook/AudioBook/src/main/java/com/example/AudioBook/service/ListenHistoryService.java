package com.example.AudioBook.service;

import com.example.AudioBook.DTO.ListenHistory.ListenHistoryRequest;
import com.example.AudioBook.DTO.ListenHistory.ListenHistoryResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ListenHistoryService {
    String addListenHistory(ListenHistoryRequest listenHistoryRequest);
    Page<ListenHistoryResponse> getListenHistory(String username, int page, int size);
}
