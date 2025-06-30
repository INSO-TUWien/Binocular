package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import com.inso_world.binocular.web.persistence.entity.sql.ModuleEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a Commit and a Module.
 */
@Entity
@Table(name = "commit_module_connections")
data class CommitModuleConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "commit_id", insertable = false, updatable = false)
  var commitId: String,

  @Column(name = "module_id", insertable = false, updatable = false)
  var moduleId: String
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "")
}
