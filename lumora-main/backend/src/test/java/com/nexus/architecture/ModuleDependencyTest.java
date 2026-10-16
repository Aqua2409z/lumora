package com.nexus.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

class ModuleDependencyTest {
    private static final List<String> MODULES = List.of("platform", "iam", "governance", "taxonomy", "asset",
            "consignment", "inspectioncustody", "catalog", "commerce", "auction", "fulfillment", "dispute", "finance", "reporting");

    @TestFactory
    Stream<DynamicTest> modulesCannotReadAnotherModulesEntitiesOrRepositories() {
        var classes = new ClassFileImporter().withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.nexus");
        return MODULES.stream().map(module -> DynamicTest.dynamicTest(module, () -> {
            String[] forbidden = MODULES.stream().filter(other -> !other.equals(module))
                    .flatMap(other -> Stream.of("com.nexus." + other + "..entity..", "com.nexus." + other + "..repository.."))
                    .toArray(String[]::new);
            noClasses().that().resideInAPackage("com.nexus." + module + "..")
                    .should().dependOnClassesThat().resideInAnyPackage(forbidden)
                    .allowEmptyShould(true).check(classes);
        }));
    }
}
