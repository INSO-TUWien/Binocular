package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Account
import com.inso_world.binocular.web.graphql.model.AccountDto
import org.springframework.stereotype.Component

@Component
class GraphQlAccountMapper {
    fun toDto(account: Account): AccountDto =
        AccountDto(
            id = account.id,
            platform = account.platform,
            login = account.login,
            name = account.name,
            avatarUrl = account.avatarUrl,
            url = account.url
        )
}
