package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.web.graphql.model.BranchDto
import org.springframework.stereotype.Component

@Component
class GraphQlBranchMapper {
    fun toDto(branch: Branch): BranchDto =
        BranchDto(
            id = branch.id,
            name = branch.name,
            branch = branch.name,
            active = branch.active,
            tracksFileRenames = branch.tracksFileRenames,
            latestCommit = branch.latestCommit
        )
}
