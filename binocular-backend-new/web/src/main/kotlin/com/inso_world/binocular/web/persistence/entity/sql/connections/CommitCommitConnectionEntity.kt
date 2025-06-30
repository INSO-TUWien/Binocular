package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between two Commits.
 */
@Entity
@Table(name = "commit_commit_connections")
data class CommitCommitConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "from_commit_id", insertable = false, updatable = false)
  var fromCommitId: String,

  @Column(name = "to_commit_id", insertable = false, updatable = false)
  var toCommitId: String,

) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "")
}
