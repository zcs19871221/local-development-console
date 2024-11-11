package com.cs.home.appProcesses;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface AppProcessRepository extends JpaRepository<AppProcess,
        Integer>,
        QuerydslPredicateExecutor<AppProcess> {

}
