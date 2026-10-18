package com.inso_world.binocular.ffi.unit.extensions

import com.inso_world.binocular.core.unit.base.BaseUnitTest
import com.inso_world.binocular.ffi.extensions.toDeveloper
import com.inso_world.binocular.ffi.extensions.toSignature
import com.inso_world.binocular.ffi.internal.GixSignature
import com.inso_world.binocular.ffi.internal.GixTime
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

/**
 * Unit tests for mapping FFI signatures to domain [Developer]/[Signature].
 */
class GixSignatureTest : BaseUnitTest() {
    private lateinit var project: Project
    private lateinit var repository: Repository

    @BeforeEach
    fun setUp() {
        project = Project(name = "test-project")
        repository =
            Repository(
                localPath = "/path/to/repo",
                projectId = project.iid,
            ).apply { this.project = project }
    }

    @Test
    fun `toDeveloper creates and registers developer with trimmed values`() {
        val ffiSig =
            GixSignature(
                name = "  Jane Dev  ",
                email = "  jane@example.com ",
                time = GixTime(seconds = 0L, offset = 0),
            )

        val developer = ffiSig.toDeveloper(repository.iid)

        assertThat(developer.name).isEqualTo("Jane Dev")
        assertThat(developer.email).isEqualTo("jane@example.com")
        assertThat(developer.repositoryId).isEqualTo(repository.iid)
    }

    @Test
    fun `toSignature wraps developer and timestamp`() {
        val ffiSig =
            GixSignature(
                name = "John Doe",
                email = "john@example.com",
                time = GixTime(seconds = 1704067200L, offset = 0), // 2024-01-01T00:00:00Z
            )

        val signature = ffiSig.toSignature(repository.iid)

        assertThat(signature.timestamp.year).isEqualTo(2024)
        assertThat(signature.timestamp.dayOfMonth).isEqualTo(1)
    }

    @Test
    fun `toDeveloper reuses existing developer by git signature`() {
        val existing =
            com.inso_world.binocular.model
                .Developer(
                    name = "Existing Dev",
                    email = "existing@example.com",
                    repositoryId = repository.iid,
                ).apply { this.repository = repository }

        val ffiSig =
            GixSignature(
                name = "Existing Dev",
                email = "existing@example.com",
                time = GixTime(seconds = 0L, offset = 0),
            )

        val result = ffiSig.toDeveloper(repository.iid)

        assertThat(result.gitSignature).isEqualTo(existing.gitSignature)
    }

    @Test
    fun `toDeveloper rejects blank name`() {
        val ffiSig =
            GixSignature(
                name = "   ",
                email = "dev@example.com",
                time = GixTime(seconds = 0L, offset = 0),
            )

        assertThrows<IllegalArgumentException> {
            ffiSig.toDeveloper(repository.iid)
        }
    }

    @Test
    fun `toDeveloper rejects blank email`() {
        val ffiSig =
            GixSignature(
                name = "Dev",
                email = "   ",
                time = GixTime(seconds = 0L, offset = 0),
            )

        assertThrows<IllegalArgumentException> {
            ffiSig.toDeveloper(repository.iid)
        }
    }
}
