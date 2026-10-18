package com.inso_world.binocular.ffi.extensions

import com.inso_world.binocular.ffi.internal.GixRemote
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.vcs.Remote

internal fun GixRemote.toModel(repositoryId: Repository.Id): Remote =
    Remote(
        name = this.name,
        url = this.url,
        repositoryId = repositoryId,
    )

internal fun Remote.toFfi(): GixRemote =
    GixRemote(
        name = this.name,
        url = this.url,
    )
