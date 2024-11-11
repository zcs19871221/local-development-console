package com.cs.home.appProcessStatus;

import java.util.List;

public interface AppProcessStatusService {

    AppProcessStatusResponse create(AppProcessStatusCreated appProcessStatusCreated);

    AppProcessStatusResponse update(AppProcessStatusUpdated appProcessStatusUpdated);

    void delete(Integer appProcessId);

    List<AppProcessStatusResponse> list();
}
