package com.cs.home.process_chain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface ProcessChainRepository extends JpaRepository<ProcessChain,
        Integer>,
        QuerydslPredicateExecutor<ProcessChain> {

}
