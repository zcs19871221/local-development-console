package com.cs.home.log_monitor;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LogMonitorServiceImpl implements LogMonitorService {
    private final LogMonitorRepository logMonitorRepository;

    private final LogMonitorMapper logMonitorMapper;

    private final MessageSource messageSource;

    @Override
    public LogMonitorResponse create(LogMonitorCreated logMonitorCreated) {
        LogMonitor logMonitor =
                logMonitorRepository.save(logMonitorMapper.map(logMonitorCreated));

        return logMonitorMapper.map(logMonitor);
    }

    @Override
    public LogMonitorResponse update(LogMonitorUpdated logMonitorUpdated) {
        validLogMonitorExists(logMonitorUpdated.getId());

        LogMonitor logMonitor =
                logMonitorRepository.save(logMonitorMapper.map(logMonitorUpdated));

        return logMonitorMapper.map(logMonitor);
    }

    @Override
    public void delete(Integer logMonitorId) {
        validLogMonitorExists(logMonitorId);
        logMonitorRepository.deleteById(logMonitorId);
    }

    @Override
    public List<LogMonitorResponse> getAll() {
        List<LogMonitor> list = logMonitorRepository.findAll();
        return logMonitorMapper.mapList(list);
    }

    @Override
    public LogMonitorResponse getById(Integer logMonitorId) {
        return logMonitorMapper.map(logMonitorRepository.getReferenceById(logMonitorId));
    }

    @Override
    public void validLogMonitorExists(Integer logMonitorId) {
        Locale locale = LocaleContextHolder.getLocale();
        if (!logMonitorRepository.existsById(logMonitorId)) {
            throw new EntityNotFoundException(messageSource.getMessage("logMonitorNotFound"
                    , new Integer[]{logMonitorId},
                    locale));
        }
    }


}
