package base

import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.util.function.Consumer
import kotlin.text.padEnd
import kotlin.text.take

internal class StreamGobbler(
    private var inputStream: java.io.InputStream,
    private var consumer: java.util.function.Consumer<String>,
    private val path: String,
) : java.lang.Runnable {
    override fun run() {
        val fixedWidth = 12
        val formattedPath = "[$path]"
        val paddedPath =
            if (formattedPath.length > fixedWidth) {
                formattedPath.take(fixedWidth)
            } else {
                formattedPath.padEnd(fixedWidth, ' ')
            }
        java.io.BufferedReader(java.io.InputStreamReader(inputStream))
            .lines()
            .forEach { line -> consumer.accept("$paddedPath\t$line") }
    }
}
