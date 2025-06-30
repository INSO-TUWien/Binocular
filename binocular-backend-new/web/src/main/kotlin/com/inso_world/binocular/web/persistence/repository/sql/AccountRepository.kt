package com.inso_world.binocular.web.persistence.repository.sql

import com.inso_world.binocular.web.persistence.entity.sql.AccountEntity
import org.springframework.context.annotation.Profile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
@Profile("sql")
interface AccountRepository : JpaRepository<AccountEntity, String> {
    fun findByLogin(login: String): AccountEntity?
}
