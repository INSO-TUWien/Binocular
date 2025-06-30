package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.BuildEntity
import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a Commit and a Build.
 */
@Entity
@Table(name = "commit_build_connections")
data class CommitBuildConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "commit_id", insertable = false, updatable = false)
  var commitId: String,

  @Column(name = "build_id", insertable = false, updatable = false)
  var buildId: String
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "")
}
