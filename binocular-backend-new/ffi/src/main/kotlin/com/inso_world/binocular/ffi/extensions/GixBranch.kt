package com.inso_world.binocular.ffi.extensions

import com.inso_world.binocular.ffi.internal.GixBranch
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository

internal fun GixBranch.toDomain(
    repositoryId: Repository.Id,
    head: Commit,
): Branch =
    Branch(
        name = this.name,
        fullName = this.fullName.toString(),
        category = this.category.toDomain(),
        repositoryId = repositoryId,
        headSha = head.sha,
    )
