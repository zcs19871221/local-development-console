package com.cs.home.process_chain;

import com.cs.home.process.ProcessRepository;
import com.cs.home.process.ProcessService;
import com.cs.home.process.RunningProcess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import javax.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessChainServiceImpl implements ProcessChainService {
    private static final int WAIT_FOR_PREVIOUS_TIMEOUT = 60 * 1000;
    private final ProcessChainRepository processChainRepository;
    private final ProcessChainMapper processChainMapper;
    private final ProcessService processService;
    private final ProcessRepository processRepository;
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private final TransactionTemplate transactionTemplate;

    @Override
    @Transactional
    public ProcessChainResponse createProcessChain(ProcessChainCreateRequest processChainCreateRequest) {
        ProcessChain processChain = processChainMapper.map(processChainCreateRequest);
        ProcessChain savedProcessChain = processChainRepository.save(processChain);
        return processChainMapper.map(savedProcessChain);
    }

    @Override
    @Transactional
    public void deleteProcessChain(Integer id) {
        validateProcessChainId(id);
        processChainRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProcessChainResponse updateProcessChain(ProcessChainUpdateRequest processChainUpdateRequest) {
        ProcessChain existingProcessChain = processChainRepository.findById(processChainUpdateRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("ProcessChain not found with ID: " +
                        processChainUpdateRequest.getId()));
        if (!existingProcessChain.getVersion().equals(processChainUpdateRequest.getVersion())) {
            throw new OptimisticLockingFailureException("ProcessChain has been modified by another transaction");
        }
        updateProcessChainConfigs(existingProcessChain.getProcessChainConfigs(),
                processChainMapper.mapProcessChainConfigs(processChainUpdateRequest.getProcessChainConfigs())
        );
        existingProcessChain.setName(processChainUpdateRequest.getName());
        ProcessChain updatedProcessChain = processChainRepository.save(existingProcessChain);
        return processChainMapper.map(updatedProcessChain);
    }

    private void updateProcessChainConfigs(List<ProcessChainConfig> existingConfigs, List<ProcessChainConfig> newConfigs) {
        Map<Integer, ProcessChainConfig> existingConfigMap = existingConfigs.stream()
                .collect(Collectors.toMap(ProcessChainConfig::getId, Function.identity()));
        Map<Integer, ProcessChainConfig> newConfigMap = newConfigs.stream()
                .filter(processChainConfig -> processChainConfig.getId() != null)
                .collect(Collectors.toMap(ProcessChainConfig::getId, Function.identity()));

        // Remove configs that are not in the new configs
        existingConfigs.removeIf(existingConfig -> !newConfigMap.containsKey(existingConfig.getId()));

        for (ProcessChainConfig newConfig : newConfigs) {
            ProcessChainConfig existingConfig = existingConfigMap.get(newConfig.getId());
            if (existingConfig == null) {
                existingConfigs.add(newConfig);
            } else {
                if (!existingConfig.getVersion().equals(newConfig.getVersion())) {
                    throw new OptimisticLockingFailureException("ProcessChainConfig has been modified by another transaction");
                }
                processChainMapper.updateProcessChainConfig(newConfig, existingConfig);
                updateProcessChainConfigs(existingConfig.getChildProcessChainConfigs(), newConfig.getChildProcessChainConfigs());
            }
        }
    }

    @Override
    public List<ProcessChainResponse> getAllProcessChain() {
        List<ProcessChain> processChains = processChainRepository.findAll();
        return processChainMapper.map(processChains);
    }

    @Override
    public ProcessChainResponse getProcessChain(Integer processChainId) {
        ProcessChain processChain = processChainRepository.findById(processChainId)
                .orElseThrow(() -> new EntityNotFoundException("ProcessChain not found with ID: " +
                        processChainId));
        return processChainMapper.map(processChain);
    }

    @Override
    @Transactional
    public void startProcessChain(Integer processChainId) throws Exception {
        ProcessChain processChain = processChainRepository.findById(processChainId)
                .orElseThrow(() -> new EntityNotFoundException("ProcessChain not found with ID: " +
                        processChainId));
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        Map<Integer, List<ProcessChainConfig>> map = new HashMap<>();
        getAllChainConfigs(processChainId, processChainConfigs, map);
        doStartProcessChain(processChainConfigs, null, map);
    }

    private void getAllChainConfigs(Integer parentId, List<ProcessChainConfig> processChainConfigs, Map<Integer, List<ProcessChainConfig>> map) {
        map.put(parentId, processChainConfigs);
        processChainConfigs.size();
        for (ProcessChainConfig processChainConfig : processChainConfigs) {
            getAllChainConfigs(processChainConfig.getId(), processChainConfig.getChildProcessChainConfigs(), map);
        }
    }

    private void doStartProcessChain(List<ProcessChainConfig> processChainConfigs, RunningProcess prevRunningProcess, Map<Integer, List<ProcessChainConfig>> map) throws InterruptedException {
        if (processChainConfigs == null) {
            return;
        }
        for (ProcessChainConfig chainConfig : processChainConfigs) {
            executorService.submit(() -> {
                try {
                    if (chainConfig.isWaitForPreviousCompletion() && prevRunningProcess != null) {
                        long startTime = System.currentTimeMillis();
                        while (prevRunningProcess.getSystemProcess().isAlive() && System.currentTimeMillis() - startTime < WAIT_FOR_PREVIOUS_TIMEOUT) {
                            // Wait for the previous process to complete
                        }
                    }
                    if (!chainConfig.isWaitForPreviousCompletion() && prevRunningProcess != null) {
                        Thread.sleep(chainConfig.getDelayInMilliseconds());
                    }
                    RunningProcess runningProcess = transactionTemplate.execute(status -> {
                        try {
                            return processService.start(chainConfig.getProcessId());
                        } catch (Exception e) {
                            log.error("error when start process chain", e);
                            return null;
                        }
                    });

                    transactionTemplate.execute(status -> {
                        try {
                            doStartProcessChain(map.get(chainConfig.getId()), runningProcess, map);
                            return null;
                        } catch (InterruptedException e) {
                            log.error("Error when starting child process chain", e);
                            return null;
                        }
                    });
                } catch (Exception e) {
                    log.error("Error when starting process chain" + e.getMessage(), e);
                }
            });
        }
    }

    @Override
    @Transactional
    public void stopProcessChain(Integer processChainId) throws Exception {
        validateProcessChainId(processChainId);
        ProcessChain processChain = processChainRepository.getReferenceById(processChainId);
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        doStopProcessChain(processChainConfigs);
    }

    @Override
    public void restartProcessChain(Integer processChainId) throws Exception {
        stopProcessChain(processChainId);
        startProcessChain(processChainId);
    }

    private void doStopProcessChain(List<ProcessChainConfig> processChainConfigs) throws Exception {
        if (processChainConfigs == null) {
            return;
        }
        for (ProcessChainConfig processChainConfig : processChainConfigs) {
            doStopProcessChain(processChainConfig.getChildProcessChainConfigs());
            processService.stop(processChainConfig.getProcessId());
        }
    }

    private void validateProcessChainId(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("ProcessChain ID is null");
        }
        if (!processChainRepository.existsById(id)) {
            throw new IllegalArgumentException("ProcessChain ID " + id + " does not exist");
        }
    }
}