package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import kotlin.uuid.Uuid

/**
 * Comprehensive unit tests for [NonRemovingMutableSet].
 *
 * Tests cover:
 * - Add operations and canonical instance preservation
 * - Contains operations with uniqueKey-based membership
 * - Size and empty state operations
 * - Removal operations (all should fail)
 * - Iterator operations and removal restrictions
 * - Concurrent operations and thread safety
 * - String representation and set equality semantics
 * - Edge cases and boundary conditions
 */
@Tag("unit")
class NonRemovingMutableSetTest {
    /**
     * Simple test entity for testing [NonRemovingMutableSet].
     * Uses `name` as the uniqueKey for deduplication.
     */
    private data class TestEntity(
        val id: String?,
        val name: String,
        val data: String = "test",
    ) : AbstractDomainObject<Uuid, String>(Uuid.random()) {
        override val uniqueKey: String get() = name
    }

    @Nested
    @DisplayName("Add operations")
    inner class AddOperations {
        @Test
        fun `add should return true for new element`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            assertThat(set.add(entity)).isTrue()
        }

        @Test
        fun `add should return false for duplicate uniqueKey`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity1 = TestEntity(null, "A", "first")
            val entity2 = TestEntity(null, "A", "second")

            set.add(entity1)

            assertThat(set.add(entity2)).isFalse()
        }

        @Test
        fun `add should preserve canonical instance when duplicate key is added`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity1 = TestEntity(null, "A", "first")
            val entity2 = TestEntity(null, "A", "second")

            set.add(entity1)
            set.add(entity2)

            val stored = set.first { it.name == "A" }
            assertThat(stored.data).isEqualTo("first")
            assertThat(stored).isSameAs(entity1)
            assertThat(stored).isNotSameAs(entity2)
        }

        @Test
        fun `add should handle multiple distinct elements`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entities =
                listOf(
                    TestEntity(null, "A"),
                    TestEntity(null, "B"),
                    TestEntity(null, "C"),
                )

            val results = entities.map { set.add(it) }

            assertThat(results).allMatch { it }
            assertThat(set).hasSize(3)
        }

        @Test
        fun `add should handle adding same instance multiple times`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            val firstAdd = set.add(entity)
            val secondAdd = set.add(entity)

            assertThat(firstAdd).isTrue()
            assertThat(secondAdd).isFalse()
            assertThat(set).hasSize(1)
        }

        @Test
        fun `add should handle elements with different data but same uniqueKey`() {
            val set = NonRemovingMutableSet<TestEntity>()

            repeat(10) { i ->
                set.add(TestEntity(null, "shared-key", "data-$i"))
            }

            assertThat(set).hasSize(1)
            assertThat(set.first().data).isEqualTo("data-0") // First one wins
        }
    }

    @Nested
    @DisplayName("Contains operations")
    inner class ContainsOperations {
        @Test
        fun `contains should return true for added element`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            set.add(entity)

            assertThat(set.contains(entity)).isTrue()
        }

        @Test
        fun `contains should return true for different instance with same uniqueKey`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity1 = TestEntity(null, "A", "first")
            val entity2 = TestEntity(null, "A", "second")

            set.add(entity1)

            assertThat(set.contains(entity2)).isTrue()
        }

        @Test
        fun `contains should return false for non-existent element`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            assertThat(set.contains(entity)).isFalse()
        }

        @Test
        fun `containsAll should return true when all elements present`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entities =
                listOf(
                    TestEntity(null, "A"),
                    TestEntity(null, "B"),
                    TestEntity(null, "C"),
                )
            entities.forEach { set.add(it) }

            assertThat(set.containsAll(entities)).isTrue()
        }

        @Test
        fun `containsAll should return false when some elements missing`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            val entities =
                listOf(
                    TestEntity(null, "A"),
                    TestEntity(null, "B"),
                )

            assertThat(set.containsAll(entities)).isFalse()
        }

        @Test
        fun `containsAll should work with different instances having same uniqueKeys`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A", "original-A"))
            set.add(TestEntity(null, "B", "original-B"))

            val probes =
                listOf(
                    TestEntity(null, "A", "probe-A"),
                    TestEntity(null, "B", "probe-B"),
                )

            assertThat(set.containsAll(probes)).isTrue()
        }

        @Test
        fun `containsAll should return true for empty collection`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            assertThat(set.containsAll(emptyList())).isTrue()
        }
    }

    @Nested
    @DisplayName("Size and empty operations")
    inner class SizeOperations {
        @Test
        fun `isEmpty should return true for new set`() {
            val set = NonRemovingMutableSet<TestEntity>()

            assertThat(set.isEmpty()).isTrue()
        }

        @Test
        fun `isEmpty should return false after adding elements`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            assertThat(set.isEmpty()).isFalse()
        }

        @Test
        fun `size should return 0 for empty set`() {
            val set = NonRemovingMutableSet<TestEntity>()

            assertThat(set.size).isEqualTo(0)
        }

        @ParameterizedTest
        @ValueSource(ints = [1, 5, 10, 50, 100])
        fun `size should return correct count after adding elements`(count: Int) {
            val set = NonRemovingMutableSet<TestEntity>()
            repeat(count) { set.add(TestEntity(null, "entity-$it")) }

            assertThat(set.size).isEqualTo(count)
        }

        @Test
        fun `size should not increase when adding duplicate keys`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A", "first"))
            set.add(TestEntity(null, "A", "second"))
            set.add(TestEntity(null, "A", "third"))

            assertThat(set.size).isEqualTo(1)
        }

        @Test
        fun `size should handle mix of unique and duplicate keys`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A", "v1"))
            set.add(TestEntity(null, "B", "v1"))
            set.add(TestEntity(null, "A", "v2")) // Duplicate
            set.add(TestEntity(null, "C", "v1"))
            set.add(TestEntity(null, "B", "v2")) // Duplicate

            assertThat(set.size).isEqualTo(3) // Only A, B, C
        }
    }

    @Nested
    @DisplayName("Removal operations (should all fail)")
    inner class RemovalOperations {
        @Test
        fun `remove should throw UnsupportedOperationException`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")
            set.add(entity)

            val ex = assertThrows<UnsupportedOperationException> { set.remove(entity) }
            assertThat(ex.message).isEqualTo("Removing objects is not allowed.")
        }

        @Test
        fun `removeAll should throw UnsupportedOperationException`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            val ex = assertThrows<UnsupportedOperationException> { set.removeAll(listOf(TestEntity(null, "A"))) }
            assertThat(ex.message).isEqualTo("Removing objects is not allowed.")
        }

        @Test
        fun `retainAll should throw UnsupportedOperationException`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            val ex = assertThrows<UnsupportedOperationException> { set.retainAll(listOf(TestEntity(null, "A"))) }
            assertThat(ex.message).isEqualTo("Removing objects is not allowed.")
        }

        @Test
        fun `clear should throw UnsupportedOperationException`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))

            val ex = assertThrows<UnsupportedOperationException> { set.clear() }
            assertThat(ex.message).isEqualTo("Removing objects is not allowed.")
        }

        @Test
        fun `removal operations should not modify set`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")
            set.add(entity)

            // Attempt removal (will throw)
            assertAll(
                { assertThrows<UnsupportedOperationException> { set.remove(entity) } },
                { assertThrows<UnsupportedOperationException> { set.clear() } },
                { assertThrows<UnsupportedOperationException> { set.removeAll(listOf(entity)) } },
                { assertThrows<UnsupportedOperationException> { set.retainAll(emptyList()) } },
            )

            // Verify set unchanged
            assertAll(
                { assertThat(set.size).isEqualTo(1) },
                { assertThat(set.contains(entity)).isTrue() },
            )
        }

        @Test
        fun `clear should throw even on empty set`() {
            val set = NonRemovingMutableSet<TestEntity>()

            val ex = assertThrows<UnsupportedOperationException> { set.clear() }
            assertThat(ex.message).isEqualTo("Removing objects is not allowed.")
        }
    }

    @Nested
    @DisplayName("Iterator operations")
    inner class IteratorOperations {
        @Test
        fun `iterator should iterate over all elements`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entities =
                listOf(
                    TestEntity(null, "A"),
                    TestEntity(null, "B"),
                    TestEntity(null, "C"),
                )
            entities.forEach { set.add(it) }

            val iterated = set.iterator().asSequence().toList()

            assertThat(iterated).hasSize(3)
            assertThat(iterated).containsExactlyInAnyOrderElementsOf(entities)
        }

        @Test
        fun `iterator hasNext should return false for empty set`() {
            val set = NonRemovingMutableSet<TestEntity>()

            assertThat(set.iterator().hasNext()).isFalse()
        }

        @Test
        fun `iterator next should return elements`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")
            set.add(entity)

            val iterator = set.iterator()

            assertThat(iterator.hasNext()).isTrue()
            assertThat(iterator.next()).isEqualTo(entity)
            assertThat(iterator.hasNext()).isFalse()
        }

        @Test
        fun `iterator remove should throw UnsupportedOperationException`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))
            val iterator = set.iterator()
            iterator.next()

            assertThatThrownBy { iterator.remove() }
                .isInstanceOf(UnsupportedOperationException::class.java)
                .hasMessageContaining("Removing objects is not allowed")
        }

        @Test
        fun `iterator should support multiple concurrent iterations`() {
            val set = NonRemovingMutableSet<TestEntity>()
            repeat(5) { set.add(TestEntity(null, "entity-$it")) }

            val iter1 = set.iterator()
            val iter2 = set.iterator()

            assertThat(iter1.asSequence().toList()).hasSize(5)
            assertThat(iter2.asSequence().toList()).hasSize(5)
        }

        @Test
        fun `iterator should iterate only over canonical instances`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val first = TestEntity(null, "A", "first")
            val second = TestEntity(null, "A", "second")

            set.add(first)
            set.add(second) // Not added due to duplicate key

            val iterated = set.iterator().asSequence().toList()

            assertThat(iterated).hasSize(1)
            assertThat(iterated.first()).isSameAs(first)
        }

        @Test
        fun `iterator remove should throw even before calling next`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))
            val iterator = set.iterator()

            assertThatThrownBy { iterator.remove() }
                .isInstanceOf(UnsupportedOperationException::class.java)
        }
    }

    @Nested
    @DisplayName("Concurrent operations")
    inner class ConcurrentOperations {
        @Test
        fun `concurrent adds should be thread-safe`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val threadCount = 10
            val elementsPerThread = 100
            val latch = CountDownLatch(threadCount)
            val executor = Executors.newFixedThreadPool(threadCount)

            repeat(threadCount) { threadId ->
                executor.submit {
                    repeat(elementsPerThread) { i ->
                        set.add(TestEntity(null, "thread-$threadId-item-$i"))
                    }
                    latch.countDown()
                }
            }

            latch.await(10, TimeUnit.SECONDS)
            executor.shutdown()

            assertThat(set.size).isEqualTo(threadCount * elementsPerThread)
        }

        @Test
        fun `concurrent adds with same key should preserve first canonical instance`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val threadCount = 100
            val latch = CountDownLatch(threadCount)
            val executor = Executors.newFixedThreadPool(threadCount)

            repeat(threadCount) { threadId ->
                executor.submit {
                    set.add(TestEntity(null, "shared-key", "thread-$threadId"))
                    latch.countDown()
                }
            }

            latch.await(10, TimeUnit.SECONDS)
            executor.shutdown()

            assertThat(set.size).isEqualTo(1)
            assertThat(set.any { it.uniqueKey == "shared-key" }).isTrue()
        }

        @Test
        fun `concurrent reads and writes should not cause errors`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val threadCount = 20
            val latch = CountDownLatch(threadCount)
            val executor = Executors.newFixedThreadPool(threadCount)

            // Pre-populate
            repeat(50) { set.add(TestEntity(null, "pre-$it")) }

            repeat(threadCount) { threadId ->
                executor.submit {
                    // Mix reads and writes
                    if (threadId % 2 == 0) {
                        repeat(50) { set.add(TestEntity(null, "writer-$threadId-$it")) }
                    } else {
                        repeat(100) {
                            set.contains(TestEntity(null, "pre-${it % 50}"))
                            set.iterator().hasNext()
                        }
                    }
                    latch.countDown()
                }
            }

            latch.await(10, TimeUnit.SECONDS)
            executor.shutdown()

            // Verify no corruption occurred
            assertThat(set.size).isGreaterThanOrEqualTo(50) // At least pre-populated items
        }

        @Test
        fun `concurrent adds with partial key overlap should deduplicate correctly`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val pool = Executors.newFixedThreadPool(8)
            val start = CountDownLatch(1)
            val done = CountDownLatch(100)

            // Names with duplicates
            val names = listOf("a", "b", "c", "d", "e")
            repeat(100) { i ->
                pool.submit {
                    try {
                        start.await()
                        val n = names[i % names.size]
                        set.add(TestEntity(null, n, "data-$i"))
                    } finally {
                        done.countDown()
                    }
                }
            }

            start.countDown()
            done.await(10, TimeUnit.SECONDS)
            pool.shutdown()

            assertThat(set.map { it.name }.toSet())
                .containsExactlyInAnyOrderElementsOf(names)
            assertThat(set).hasSize(names.size)
        }
    }

    @Nested
    @DisplayName("String representation and equality")
    inner class StringAndEquality {
        @Test
        fun `toString should return string representation of values`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A", "test-data")
            set.add(entity)

            val result = set.toString()

            assertThat(result).contains("A")
        }

        @Test
        fun `toString should return empty collection format for empty set`() {
            val set = NonRemovingMutableSet<TestEntity>()

            assertThat(set.toString()).isEqualTo("[]")
        }

        @Test
        fun `should maintain set equality semantics`() {
            val set1 = NonRemovingMutableSet<TestEntity>()
            val set2 = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            set1.add(entity)
            set2.add(entity)

            assertThat(set1).isEqualTo(set2)
        }

        @Test
        fun `sets with different elements should not be equal`() {
            val set1 = NonRemovingMutableSet<TestEntity>()
            val set2 = NonRemovingMutableSet<TestEntity>()

            set1.add(TestEntity(null, "A"))
            set2.add(TestEntity(null, "B"))

            assertThat(set1).isNotEqualTo(set2)
        }

        @Test
        fun `empty sets should be equal`() {
            val set1 = NonRemovingMutableSet<TestEntity>()
            val set2 = NonRemovingMutableSet<TestEntity>()

            assertThat(set1).isEqualTo(set2)
        }
    }

    @Nested
    @DisplayName("Edge cases and boundary conditions")
    inner class EdgeCases {
        @Test
        fun `should handle large number of elements`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val count = 10_000

            repeat(count) { set.add(TestEntity(null, "entity-$it")) }

            assertThat(set.size).isEqualTo(count)
        }

        @Test
        fun `should handle elements with null id`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity(null, "A")

            set.add(entity)

            assertThat(set.contains(entity)).isTrue()
        }

        @Test
        fun `should handle elements with non-null id`() {
            val set = NonRemovingMutableSet<TestEntity>()
            val entity = TestEntity("id-123", "A")

            set.add(entity)

            assertThat(set.contains(entity)).isTrue()
        }

        @Test
        fun `should work with for-each loop`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))
            set.add(TestEntity(null, "B"))

            val collected = mutableListOf<String>()
            for (entity in set) {
                collected.add(entity.name)
            }

            assertThat(collected).containsExactlyInAnyOrder("A", "B")
        }

        @Test
        fun `should work with collection operations`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))
            set.add(TestEntity(null, "B"))

            val filtered = set.filter { it.name == "A" }
            val mapped = set.map { it.name }

            assertThat(filtered).hasSize(1)
            assertThat(mapped).containsExactlyInAnyOrder("A", "B")
        }

        @Test
        fun `should handle add during iteration`() {
            val set = NonRemovingMutableSet<TestEntity>()
            set.add(TestEntity(null, "A"))
            set.add(TestEntity(null, "B"))

            // Iterator is weakly consistent - may or may not see new additions
            val iterator = set.iterator()
            set.add(TestEntity(null, "C"))

            // Should not throw exception
            var count = 0
            while (iterator.hasNext()) {
                iterator.next()
                count++
            }

            assertThat(count).isGreaterThanOrEqualTo(2)
        }
    }
}
