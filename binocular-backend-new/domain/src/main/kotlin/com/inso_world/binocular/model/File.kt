@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.model

import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Domain model for a File, representing a file in a Git repository.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
@OptIn(ExperimentalUuidApi::class)
data class File(
    var path: String,
    override val iid: File.Id = Id(Uuid.random()),
) : AbstractDomainObject<File.Id, File.Key>(
        iid,
    ) {
    @JvmInline
    value class Id(
        override val value: Uuid
    ) : DomainId

    data class Key(
        val path: String,
    ) // value object for lookups

    // some database dependent id
    @Deprecated("Avoid using database specific id, use business key .iid", ReplaceWith("iid"))
    var id: String? = null

    @Deprecated("legacy")
    lateinit var webUrl: String

    @Deprecated("legacy")
    var maxLength: Long = Int.MIN_VALUE.toLong()

    @Deprecated("legacy")
    var modules: List<Module.Id> = emptyList()

    override val uniqueKey: Key
        get() = Key(this.path)

    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String = "File(path='$path', id=$id)"
}
