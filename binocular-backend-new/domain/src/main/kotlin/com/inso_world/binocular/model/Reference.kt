package com.inso_world.binocular.model

import com.inso_world.binocular.model.vcs.ReferenceCategory
import jakarta.validation.constraints.NotNull
import kotlin.uuid.Uuid

abstract class Reference<Key>(
    @field:NotNull
    open val category: ReferenceCategory,
    @field:NotNull
    open val repositoryId: Repository.Id,
    override val iid: Reference.Id = Id(Uuid.random()),
) : AbstractDomainObject<Reference.Id, Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    override fun equals(other: Any?): Boolean = super.equals(other)

    override fun hashCode(): Int = super.hashCode()
}
