package com.example.AudioBook.service.impl;

import com.example.AudioBook.DTO.ListenHistory.ListenHistoryRequest;
import com.example.AudioBook.DTO.ListenHistory.ListenHistoryResponse;
import com.example.AudioBook.entity.ListenHistory;
import com.example.AudioBook.repository.ListenHistoryRepository;
import com.example.AudioBook.repository.UserRepository;
import com.example.AudioBook.service.ListenHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ListenHistoryServiceImpl implements ListenHistoryService {

    @Autowired
    private ListenHistoryRepository listenHistoryRepository;
    @Autowired
    private UserRepository userRepository;
    @Override
    public String addListenHistory(ListenHistoryRequest listenHistoryRequest) {
        ListenHistory listenHistory = new ListenHistory();
        listenHistory.setAudio_url(listenHistoryRequest.getAudioUrl());
        listenHistory.setTitleOfBook(listenHistoryRequest.getTitleOfBook());
        listenHistory.setTitleOfChapter(listenHistoryRequest.getTitleOfChapter());
        listenHistory.setNameOfAudio(listenHistoryRequest.getNameOfAudio());
        listenHistory.setTime(listenHistoryRequest.getTime());
        listenHistory.setUser(userRepository.findByUsername(listenHistoryRequest.getUsername()).get());
        listenHistoryRepository.save(listenHistory);
        return "Ok";
    }

    @Override
    public Page<ListenHistoryResponse> getListenHistory(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ListenHistory> listenHistories = listenHistoryRepository.findAllByUser(
            userRepository.findByUsername(username).get(),
            pageable
        );
        
        return listenHistories.map(listenHistory -> {
            ListenHistoryResponse listenHistoryResponse = new ListenHistoryResponse();
            listenHistoryResponse.setAudioUrl(listenHistory.getAudio_url());
            listenHistoryResponse.setTitleOfBook(listenHistory.getTitleOfBook());
            listenHistoryResponse.setTitleOfChapter(listenHistory.getTitleOfChapter());
            listenHistoryResponse.setNameOfAudio(listenHistory.getNameOfAudio());
            listenHistoryResponse.setTime(listenHistory.getTime());
            listenHistoryResponse.setUsername(username);
            return listenHistoryResponse;
        });
    }
}
