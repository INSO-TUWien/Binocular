package com.inso_world.binocular.model.vcs

import com.inso_world.binocular.model.AbstractDomainObject
import com.inso_world.binocular.model.DomainId
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.validation.GitUrl
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import kotlin.uuid.Uuid

/**
 * Remote — a named URL endpoint referencing an external Git repository location.
 */
data class Remote(
    @field:NotBlank
    @field:Pattern(
        regexp = "^[a-zA-Z0-9._/-]+$",
        message = "Remote name must contain only alphanumeric characters, dots, underscores, slashes, or hyphens"
    )
    val name: String,

    @field:NotBlank
    @field:GitUrl
    var url: String,

    val repositoryId: Repository.Id,
    @Deprecated("Use repositoryId instead")
    var repository: Repository? = null,
    override val iid: Remote.Id = Id(Uuid.random()),
) : AbstractDomainObject<Remote.Id, Remote.Key>(
    iid
) {
    /**
     * Type-safe wrapper for the technical identity of a [Remote].
     */
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    /**
     * Business key for a [Remote]: unique combination of repository ID and remote name.
     */
    data class Key(val repositoryId: Repository.Id, val name: String)

    /**
     * Optional database-specific identifier.
     */
    @Deprecated("Avoid using database specific id, use business key .iid", ReplaceWith("iid"))
    var id: String? = null

    init {
        require(name.trim().isNotBlank()) { "Remote name cannot be blank." }
        require(url.trim().isNotBlank()) { "Remote URL cannot be blank." }
    }

    override val uniqueKey: Key
        get() = Key(repositoryId, name.trim())

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String =
        "Remote(id=$id, iid=$iid, name='$name', url='$url', repositoryId=$repositoryId)"
}
