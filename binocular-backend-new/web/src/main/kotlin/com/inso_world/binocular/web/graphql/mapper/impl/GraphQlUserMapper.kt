package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.User
import com.inso_world.binocular.web.graphql.model.UserDto
import org.springframework.stereotype.Component

@Component
class GraphQlUserMapper {
    fun toDto(user: User): UserDto =
        UserDto(
            id = user.id,
            name = user.name,
            email = user.email,
            gitSignature = user.gitSignature
        )
}
