package com.cs.home.process;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;

import java.util.Observable;
import java.util.Observer;

@RequiredArgsConstructor
public class FileWriterObserver implements Observer {
    private final RunningProcess runningProcess;

    @SneakyThrows
    @Override
    public void update(Observable o, Object arg) {
        runningProcess.setStatusAndHighlightLog();
        o.deleteObserver(this);
    }
}
