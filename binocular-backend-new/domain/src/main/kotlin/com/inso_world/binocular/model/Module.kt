package com.inso_world.binocular.model

import kotlin.uuid.Uuid

/**
 * Domain model for a Module, representing a code module or package in the codebase.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
data class Module(
    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null,
    var path: String,
    // Relationships
    var commitIds: List<Commit.Id> = emptyList(),
    var fileIds: List<File.Id> = emptyList(),
    var childModuleIds: List<Module.Id> = emptyList(),
    var parentModuleIds: List<Module.Id> = emptyList(),
    @Deprecated("Use commitIds instead")
    var commits: List<Commit> = emptyList(),
    @Deprecated("Use fileIds instead")
    var files: List<File> = emptyList(),
    @Deprecated("Use childModuleIds instead")
    var childModules: List<Module> = emptyList(),
    @Deprecated("Use parentModuleIds instead")
    var parentModules: List<Module> = emptyList(),
    override val iid: Module.Id = Id(Uuid.random()),
): AbstractDomainObject<Module.Id, Module.Key>(
    iid
){
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val path: String)

    override val uniqueKey: Key
        get() = Key(path)

    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode() = super.hashCode()
}
