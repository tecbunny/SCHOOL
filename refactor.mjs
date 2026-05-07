import { Project, SyntaxKind } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths([
  "src/app/api/auth/**/route.ts",
  "src/app/api/hardware/**/route.ts",
  "src/app/api/school/**/route.ts",
  "src/app/api/eduos/**/route.ts"
]);

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;

  const functions = sourceFile.getFunctions();
  
  for (const func of functions) {
    if (!func.isExported()) continue;
    const name = func.getName();
    if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(name)) continue;

    const body = func.getBody();
    if (!body || body.getKind() !== SyntaxKind.Block) continue;

    const bodyText = body.getText();
    if (bodyText.includes("error instanceof AppError")) continue;

    const statements = body.getStatements();
    if (statements.length === 1 && statements[0].getKind() === SyntaxKind.TryStatement) {
      // Replace existing catch clause
      const tryStmt = statements[0];
      const catchClause = tryStmt.getCatchClause();
      if (catchClause) {
        const catchBlock = catchClause.getBlock();
        // Just completely replace the block text
        catchBlock.replaceWithText(`{\n  if (error instanceof AppError) {\n    return NextResponse.json(\n      { error: error.message, code: error.code },\n      { status: error.statusCode }\n    );\n  }\n  console.error("[${name}] Unhandled Error:", error);\n  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });\n}`);
        
        // ensure catch variable is `error: unknown`
        const variableDecl = catchClause.getVariableDeclaration();
        if (variableDecl) {
            variableDecl.setType("unknown");
            if (variableDecl.getName() !== "error") {
                variableDecl.rename("error");
            }
        }
        changed = true;
      }
    } else {
      // Wrap everything in try/catch
      const statementsText = statements.map(s => s.getText()).join("\n");
      func.setBodyText(`try {\n${statementsText}\n} catch (error: unknown) {\n  if (error instanceof AppError) {\n    return NextResponse.json(\n      { error: error.message, code: error.code },\n      { status: error.statusCode }\n    );\n  }\n  console.error("[${name}] Unhandled Error:", error);\n  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });\n}`);
      changed = true;
    }
  }

  if (changed) {
    let hasAppError = false;
    let hasNextResponse = false;
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier === "@/lib/errors") {
        const namedImports = importDecl.getNamedImports();
        if (namedImports.some(ni => ni.getName() === "AppError")) {
          hasAppError = true;
        } else {
           importDecl.addNamedImport("AppError");
           hasAppError = true;
        }
      }
      if (moduleSpecifier === "next/server") {
         const namedImports = importDecl.getNamedImports();
         if (namedImports.some(ni => ni.getName() === "NextResponse")) {
           hasNextResponse = true;
         } else {
           importDecl.addNamedImport("NextResponse");
           hasNextResponse = true;
         }
      }
    }
    
    if (!hasAppError) {
      sourceFile.addImportDeclaration({
        namedImports: ["AppError"],
        moduleSpecifier: "@/lib/errors"
      });
    }
    if (!hasNextResponse) {
      sourceFile.addImportDeclaration({
        namedImports: ["NextResponse"],
        moduleSpecifier: "next/server"
      });
    }
    
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}
