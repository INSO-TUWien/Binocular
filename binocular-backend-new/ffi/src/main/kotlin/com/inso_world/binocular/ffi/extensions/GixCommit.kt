package com.inso_world.binocular.ffi.extensions

import com.inso_world.binocular.ffi.internal.GixCommit
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository

private fun String.validateSha(): String {
    require(this.length == 40) {
        "Invalid SHA '$this': must be exactly 40 characters, got ${this.length}"
    }
    require(this.all { it in '0'..'9' || it in 'a'..'f' || it in 'A'..'F' }) {
        "Invalid SHA '$this': must contain only hexadecimal characters [0-9a-fA-F]"
    }
    return this
}

internal fun GixCommit.toDomain(repositoryId: Repository.Id,): Commit {
    this.oid.validateSha()

    val authorSignature = this.author.toSignature(repositoryId)
    val committerSignature = this.committer.toSignature(repositoryId)

    return Commit(
        sha = this.oid,
        authorSignature = authorSignature,
        committerSignature = if (authorSignature == committerSignature) authorSignature else committerSignature,
        message = this.message,
        repositoryId = repositoryId,
    )
}

internal fun Collection<GixCommit>.toDomain(repositoryId: Repository.Id): List<Commit> {
    val mappedInOrder: List<Commit> =
        this.map { vec ->
            vec.toDomain(repositoryId)
        }

    val bySha = mappedInOrder.associateBy { it.sha }

    this.forEach { vec ->
        val child = bySha.getValue(vec.oid)
        vec.parents.forEach { parentSha ->
            child.parentShas.add(parentSha)
        }
    }

    return mappedInOrder
}
