package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import com.inso_world.binocular.web.persistence.entity.sql.IssueEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between an Issue and a Commit.
 */
@Entity
@Table(name = "issue_commit_connections")
data class IssueCommitConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "issue_id", insertable = false, updatable = false)
  var issueId: String,

  @Column(name = "commit_id", insertable = false, updatable = false)
  var commitId: String
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "")
}
