package com.cs.home.process_chain;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProcessChainMapper {
    ProcessChain map(ProcessChainCreateRequest processChainCreateRequest);

    ProcessChainConfig map(ProcessChainConfigRequest processChainConfigRequest);

    ProcessChain map(ProcessChainUpdateRequest processChainUpdateRequest);

    ProcessChainResponse map(ProcessChain processChain);

    List<ProcessChainResponse> map(List<ProcessChain> processChainList);

    List<ProcessChainConfig> mapProcessChainConfigs(List<ProcessChainConfigRequest> processChainConfigRequest);


}
