package com.cs.home.appProcessStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppProcessStatusServiceImpl implements AppProcessStatusService {

    private final AppProcessStatusRepository appProcessStatusRepository;

    private final AppProcessStatusMapper appProcessStatusMapper;

    @Override
    public AppProcessStatusResponse create(AppProcessStatusCreated appProcessStatusCreated) {
        AppProcessStatus appProcessStatus =
                appProcessStatusRepository.save(appProcessStatusMapper.map(appProcessStatusCreated));

        return appProcessStatusMapper.map(appProcessStatus);
    }

    @Override
    public AppProcessStatusResponse update(AppProcessStatusUpdated appProcessStatusUpdated) {
        AppProcessStatus appProcessStatus =
                appProcessStatusRepository.save(appProcessStatusMapper.map(appProcessStatusUpdated));

        return appProcessStatusMapper.map(appProcessStatus);
    }

    @Override
    public void delete(Integer appProcessId) {
        if (appProcessStatusRepository.existsById(appProcessId)) {
            appProcessStatusRepository.deleteById(appProcessId);
        }
    }

    @Override
    public List<AppProcessStatusResponse> list() {
        List<AppProcessStatus> list = appProcessStatusRepository.findAll();
        return appProcessStatusMapper.map(list);
    }

}
