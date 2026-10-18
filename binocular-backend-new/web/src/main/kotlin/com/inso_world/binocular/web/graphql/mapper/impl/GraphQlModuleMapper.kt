package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Module
import com.inso_world.binocular.web.graphql.model.ModuleDto
import org.springframework.stereotype.Component

@Component
class GraphQlModuleMapper {
    fun toDto(module: Module): ModuleDto =
        ModuleDto(
            id = module.id,
            path = module.path
        )
}
