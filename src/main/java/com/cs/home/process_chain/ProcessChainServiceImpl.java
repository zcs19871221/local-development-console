package com.cs.home.process_chain;

import com.cs.home.process.ProcessRepository;
import com.cs.home.process.ProcessService;
import com.cs.home.process.ProcessServiceImpl;
import com.cs.home.process.RunningProcess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessChainServiceImpl implements ProcessChainService {

    private final ProcessChainRepository processChainRepository;

    private final ProcessChainMapper processChainMapper;

    private final ProcessService processService;

    private final ProcessRepository processRepository;

    @Override
    @Transactional
    public ProcessChainResponse createProcessChain(ProcessChainCreateRequest processChainCreateRequest) {
        ProcessChain xx = processChainMapper.map(processChainCreateRequest);
        ProcessChain processChain = processChainRepository.save(xx);
        return processChainMapper.map(processChain);
    }

    @Override
    public void deleteProcessChain(Integer id) {
        validProcessChainId(id);
        processChainRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProcessChainResponse updateProcessChain(ProcessChainUpdateRequest processChainUpdateRequest) {
        ProcessChain existingProcessChain = processChainRepository.findById(processChainUpdateRequest.getId())
                .orElseThrow(() -> new EntityNotFoundException("ProcessChain not found"));

        if (!existingProcessChain.getVersion().equals(processChainUpdateRequest.getVersion())) {
            throw new OptimisticLockingFailureException("ProcessChain has been modified by another transaction");
        }

        updateProcessChainConfigs(existingProcessChain.getProcessChainConfigs(),
                processChainMapper.mapProcessChainConfigs(processChainUpdateRequest.getProcessChainConfigs())
        );

        existingProcessChain.setName(processChainUpdateRequest.getName());
        processChainRepository.save(existingProcessChain);
        return processChainMapper.map(existingProcessChain);
    }

    private void updateProcessChainConfigs(List<ProcessChainConfig> existingConfigs, List<ProcessChainConfig> newConfigs) {
        Map<Integer, ProcessChainConfig> existingConfigMap = existingConfigs.stream()
                .collect(Collectors.toMap(ProcessChainConfig::getId, Function.identity()));

        Map<Integer, ProcessChainConfig> newConfigMap = newConfigs.stream()
                .filter(processChainConfig -> processChainConfig.getId() != null)
                .collect(Collectors.toMap(ProcessChainConfig::getId, Function.identity()));

        existingConfigs.removeIf(
                existingConfig -> !newConfigMap.containsKey(existingConfig.getId()));

        for (ProcessChainConfig newConfig : newConfigs) {
            ProcessChainConfig existingConfig = existingConfigMap.get(newConfig.getId());
            if (existingConfig == null) {
                existingConfigs.add(newConfig);
            } else {
                if (!existingConfig.getVersion().equals(newConfig.getVersion())) {
                    throw new OptimisticLockingFailureException("ProcessChainConfig has been modified by another transaction");
                }
                existingConfig.setDelayInMilliseconds(newConfig.getDelayInMilliseconds());
                existingConfig.setProcessId(newConfig.getProcessId());
                existingConfig.setWaitForPreviousCompletion(newConfig.isWaitForPreviousCompletion());
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
    public void startProcessChain(Integer processChainId) throws Exception {
        validProcessChainId(processChainId);
        ProcessChain processChain = processChainRepository.getReferenceById(processChainId);
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        int matchedProcessCount = processChainRepository.findAllById(processChainConfigs.stream().map(ProcessChainConfig::getProcessId).toList()).size();
        if (matchedProcessCount != processChainConfigs.size()) {
            throw new RuntimeException("processChain configs has invalid process");
        }
        doStartProcessChain(processChainConfigs, null);
    }

    private void doStartProcessChain(List<ProcessChainConfig> processChainConfigs, Integer prevProcessId) throws InterruptedException {
        if (processChainConfigs == null) {
            return;
        }
        RunningProcess prev = ProcessServiceImpl.idMapProcess.get(prevProcessId);
        for (ProcessChainConfig chainConfig : processChainConfigs) {
            new Thread(() -> {
                try {
                    if (chainConfig.isWaitForPreviousCompletion() && prev != null) {
                        long startTime = System.currentTimeMillis(); // Get the current time in milliseconds
                        while (prev.getSystemProcess().isAlive() && System.currentTimeMillis() - startTime < 60 * 1000) {

                        }
                    }
                    if (!chainConfig.isWaitForPreviousCompletion() && prev != null) {
                        Thread.sleep(chainConfig.getDelayInMilliseconds());
                    }
                    processService.start(chainConfig.getProcessId());
                    doStartProcessChain(chainConfig.getChildProcessChainConfigs(), chainConfig.getProcessId());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

        }
    }

    @Override
    public void stopProcessChain(Integer processChainId) throws Exception {
        validProcessChainId(processChainId);
        ProcessChain processChain = processChainRepository.getReferenceById(processChainId);
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        doStopProcessChain(processChainConfigs);
    }

    private void doStopProcessChain(List<ProcessChainConfig> processChainConfigs) throws Exception {
        if (processChainConfigs == null) {
            return;
        }
        for (ProcessChainConfig processChainConfig : processChainConfigs) {
            processService.stop(processChainConfig.getProcessId());
            doStopProcessChain(processChainConfig.getChildProcessChainConfigs());
        }
    }


    private void validProcessChainId(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("processChain Id is null");
        }

        if (!processChainRepository.existsById(id)) {
            throw new IllegalArgumentException("processChain Id" + id + "does not exists");
        }
    }


}
