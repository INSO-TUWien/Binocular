package com.inso_world.binocular.jgit.tree;

import com.inso_world.binocular.jgit.JGitGitIndexer;
import com.inso_world.binocular.model.Branch;
import com.inso_world.binocular.model.Commit;
import com.inso_world.binocular.model.Repository;
import com.inso_world.binocular.model.git.GitDepsTree;
import com.inso_world.binocular.model.git.GitTreeNode;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Integration Test: baut einen Deps Tree fuer einen realen lokalen Branch und schreibt ihn als Textdatei
 * nach cli/target/git-deps-trees/, damit du ihn direkt anschauen kannst.
 *
 * Steuerung ueber System Properties:
 * -Dbinocular.repoPath=/pfad/zum/repo (default: user.dir)
 * -Dbinocular.branch=my-branch        (default: main, sonst master, sonst erster Branch)
 * -Dbinocular.commitLimit=250         (default: 250)
 */
public class GitDepsTreeOnCurrentRepoIT {

    @Test
    void buildsTreeForLocalBranchAndWritesAscii() throws Exception {
        Path start = Paths.get(System.getProperty("binocular.repoPath", System.getProperty("user.dir")))
                .toAbsolutePath()
                .normalize();

        JGitGitIndexer indexer = new JGitGitIndexer();

        Repository repo;
        try {
            repo = indexer.findRepo(start);
        } catch (Exception e) {
            Assumptions.assumeTrue(false, "Kein Git Repo gefunden ab: " + start);
            return;
        }

        List<Branch> branches = indexer.findAllBranches(repo);
        Assumptions.assumeTrue(!branches.isEmpty(), "Keine Branches gefunden");

        String desired = System.getProperty("binocular.branch");
        Branch branch = pickBranch(branches, desired);
        Assumptions.assumeTrue(branch != null, "Branch nicht gefunden: " + desired);

        int limit = parseIntOrDefault(System.getProperty("binocular.commitLimit"), 250);
        List<Commit> commits = indexer.traverseBranch(repo, branch);
        if (commits.size() > limit) {
            commits = commits.subList(0, limit);
        }

        GitDepsTreeBuilder builder = new GitDepsTreeBuilder();
        GitDepsTree tree = builder.build(repo, commits);

        Path projectRoot = guessProjectRootFrom(start);
        Path outDir = projectRoot.resolve("cli").resolve("target").resolve("git-deps-trees");
        Files.createDirectories(outDir);

        String fileName = "deps-tree-" + sanitize(branch.getName()) + ".txt";
        Path outFile = outDir.resolve(fileName);

        String ascii = renderAscii(tree);
        Files.writeString(outFile, ascii, StandardCharsets.UTF_8);

        System.out.println("Wrote deps tree to: " + outFile.toAbsolutePath());

        Assertions.assertTrue(tree.getNodes() != null && !tree.getNodes().isEmpty(), "Tree hat keine Nodes");
        Assertions.assertTrue(tree.getColumns() >= 1, "Columns muss >= 1 sein");
        Assertions.assertTrue(tree.getRows() >= 1, "Rows muss >= 1 sein");
    }

    private static Branch pickBranch(List<Branch> branches, String desired) {
        if (desired != null && !desired.isBlank()) {
            Optional<Branch> exact = branches.stream().filter(b -> desired.equals(b.getName())).findFirst();
            if (exact.isPresent()) return exact.get();
        }

        Optional<Branch> main = branches.stream().filter(b -> "main".equals(b.getName())).findFirst();
        if (main.isPresent()) return main.get();

        Optional<Branch> master = branches.stream().filter(b -> "master".equals(b.getName())).findFirst();
        if (master.isPresent()) return master.get();

        return branches.get(0);
    }

    private static int parseIntOrDefault(String s, int def) {
        try {
            if (s == null) return def;
            return Integer.parseInt(s.trim());
        } catch (Exception ignored) {
            return def;
        }
    }

    private static String sanitize(String s) {
        if (s == null || s.isBlank()) return "unknown";
        return s.replaceAll("[^a-zA-Z0-9._-]+", "_");
    }

    private static Path guessProjectRootFrom(Path start) {
        Path p = start;
        for (int i = 0; i < 12 && p != null; i++) {
            if (Files.exists(p.resolve("pom.xml")) && Files.isDirectory(p.resolve("cli"))) {
                return p;
            }
            p = p.getParent();
        }
        return start;
    }

    private static String renderAscii(GitDepsTree tree) {
        List<GitTreeNode> nodes = new ArrayList<>(tree.getNodes());
        nodes.sort(Comparator.comparingInt(GitTreeNode::getRowIndex));

        int rows = tree.getRows();
        if (rows <= 0 && !nodes.isEmpty()) {
            rows = nodes.get(nodes.size() - 1).getRowIndex() + 1;
        }

        int cols = tree.getColumns();
        if (cols <= 0) {
            int max = nodes.stream().mapToInt(GitTreeNode::getColumnIndex).max().orElse(0);
            cols = max + 1;
        }

        Map<Integer, List<GitTreeNode>> byRow = new HashMap<>();
        for (GitTreeNode n : nodes) {
            byRow.computeIfAbsent(n.getRowIndex(), k -> new ArrayList<>()).add(n);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("rows=").append(rows).append(" cols=").append(cols).append("\n");
        sb.append("Legend: '*' ist ein Commit Node, Reihenfolge ist die Row aus dem Builder\n\n");

        for (int r = 0; r < rows; r++) {
            List<GitTreeNode> rowNodes = byRow.getOrDefault(r, List.of());
            char[] lane = new char[Math.max(1, cols * 2 - 1)];
            for (int i = 0; i < lane.length; i++) lane[i] = ' ';

            for (GitTreeNode n : rowNodes) {
                int pos = Math.min(lane.length - 1, Math.max(0, n.getColumnIndex() * 2));
                lane[pos] = '*';
            }

            String info = rowNodes.stream()
                    .sorted(Comparator.comparingInt(GitTreeNode::getColumnIndex))
                    .map(GitDepsTreeOnCurrentRepoIT::nodeInfo)
                    .collect(Collectors.joining(" | "));

            sb.append(String.format(Locale.ROOT, "%4d ", r)).append(lane).append("  ").append(info).append("\n");
        }

        return sb.toString();
    }

    private static String nodeInfo(GitTreeNode n) {
        String sha = n.getCommitSha() == null ? "null" : n.getCommitSha();
        String shortSha = sha.length() > 7 ? sha.substring(0, 7) : sha;

        Set<String> names = n.getBranchNames();
        String branches = (names == null || names.isEmpty()) ? "" : (" [" + String.join(",", names) + "]");

        return shortSha + branches;
    }
}
