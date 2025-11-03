# Programming Learning & Projects Structure

このディレクトリは、C言語とC++の学習記録（Notes）と、それらの知識を応用したプロジェクト（Projects）を整理するためのものです。将来的には、C#、JavaScript、Pythonなどの言語も追加していく予定です。

---

## ディレクトリ構造

```
~/Programming/
├── C_lang/
│   ├── Notes/
│   │   ├── Basics/
│   │   │   ├── DataTypes/
│   │   │   ├── Operators/
│   │   │   ├── ControlFlow/
│   │   │   ├── Functions/
│   │   │   ├── IO/
│   │   │   └── Preprocessor/
│   │   ├── PointersMem/
│   │   │   ├── Pointers/
│   │   │   ├── Arrays/
│   │   │   ├── Strings/
│   │   │   └── DynamicMem/
│   │   ├── DataStructsIO/
│   │   │   ├── StructsUnions/
│   │   │   └── FileIO/
│   │   └── AdvancedTopics/
│   └── Projects/
│       ├── HelloWorld/
│       ├── DataProcessor/
│       └── ...
├── CPP/
│   ├── Notes/
│   │   ├── Basics/
│   │   │   ├── IOStreams/
│   │   │   ├── References/
│   │   │   ├── Namespaces/
│   │   │   ├── FuncOverload/
│   │   │   └── TypeCasting/
│   │   ├── OOP/
│   │   │   ├── ClassesObjs/
│   │   │   ├── CtorDtor/
│   │   │   ├── Inheritance/
│   │   │   ├── Polymorphism/
│   │   │   └── AccessSpec/
│   │   ├── TemplatesSTL/
│   │   │   ├── FuncTemplates/
│   │   │   ├── ClassTemplates/
│   │   │   ├── Containers/
│   │   │   ├── Algorithms/
│   │   │   └── Iterators/
│   │   ├── ModernCpp/
│   │   │   ├── Exceptions/
│   │   │   ├── SmartPointers/
│   │   │   ├── Lambdas/
│   │   │   ├── Concurrency/
│   │   │   └── MoveSemantics/
│   │   └── AdvancedTopics/
│   └── Projects/
│       ├── Calculator/
│       ├── GameEngine/
│       └── ...
├── CSharp/
│   ├── Notes/
│   │   ├── Basics/
│   │   │   ├── Variables/
│   │   │   ├── Operators/
│   │   │   ├── ControlFlow/
│   │   │   ├── Functions/
│   │   │   └── IO/
│   │   ├── OOP/
│   │   │   ├── Classes/
│   │   │   ├── Interfaces/
│   │   │   ├── Inheritance/
│   │   │   └── Polymorphism/
│   │   └── AdvancedTopics/
│   │       ├── DelegatesEvents/
│   │       ├── LINQ/
│   │       └── AsyncAwait/
│   └── Projects/
├── JavaScript/
│   ├── Notes/
│   │   ├── Basics/
│   │   │   ├── Variables/
│   │   │   ├── DataTypes/
│   │   │   ├── Operators/
│   │   │   ├── ControlFlow/
│   │   │   └── Functions/
│   │   ├── DOM/
│   │   │   ├── Elements/
│   │   │   ├── Events/
│   │   │   └── Manipulation/
│   │   ├── Async/
│   │   │   ├── Callbacks/
│   │   │   ├── Promises/
│   │   │   └── AsyncAwait/
│   │   └── Modules/
│   │       ├── ESModules/
│   │       └── CommonJS/
│   └── Projects/
└── Python/
    ├── Notes/
    │   ├── Basics/
    │   │   ├── Variables/
    │   │   ├── DataTypes/
    │   │   ├── Operators/
    │   │   ├── ControlFlow/
    │   │   └── Functions/
    │   ├── DataStructures/
    │   │   ├── Lists/
    │   │   ├── Tuples/
    │   │   ├── Dictionaries/
    │   │   └── Sets/
    │   ├── OOP/
    │   │   ├── Classes/
    │   │   ├── Inheritance/
    │   │   └── Polymorphism/
    │   └── ModulesPackages/
    │       ├── ImportSystem/
    │       └── StandardLibrary/
    └── Projects/
        
```

---

## 運用ガイドライン

この `Programming` ディレクトリは、C言語とC++の学習記録とプロジェクトを体系的に管理することを目的としています。以下のガイドラインに従って運用してください。将来的にはC#、JavaScript、Pythonなどの言語も同様に管理します。

### 1. 言語別ディレクトリ (`C_lang/`, `CPP/`, `CSharp/`, `JavaScript/`, `Python/` など)

*   **目的**: 各言語それぞれの学習内容とプロジェクトを完全に独立して管理します。
*   **構成**: 各言語ディレクトリは、学習記録をまとめる `Notes/` と、知識を応用するプロジェクトを格納する `Projects/` で構成されます。

### 2. 学習記録ディレクトリ (`Notes/`)

*   **目的**: 学習した文法、概念、ライブラリ機能などをリファレンスとして詳細に記録します。
*   **ファイル形式**: 各トピックの詳細は **HTMLファイル (`.html`)** で作成します。
    *   例: `C_lang/Notes/Basics/IO/printf.html`
    *   例: `CPP/Notes/TemplatesSTL/Containers/vector.html`
    *   例: `CSharp/Notes/OOP/Classes/ClassDefinition.html`
    *   例: `JavaScript/Notes/DOM/Events/ClickEvent.html`
    *   例: `Python/Notes/DataStructures/Lists/ListMethods.html`
*   **構造**: 必要に応じてサブディレクトリを作成し、概念を細かく分類することで、特定の情報を素早く見つけられるようにします。
*   **内容**: 各HTMLファイルには、概念の説明、コード例、注意点、関連情報などを網羅的に記述し、将来の参照に耐えうる品質を目指してください。

### 3. プロジェクトディレクトリ (`Projects/`)

*   **目的**: `Notes` で学んだ知識を実際にコードとして実装し、理解を深めるための応用プロジェクトを格納します。
*   **構成**: 各プロジェクトは独立したディレクトリとして作成し、その中にソースコード、ビルドスクリプト、テストコードなどをまとめてください。
    *   例: `C/Projects/HelloWorld/`
    *   例: `CPP/Projects/Calculator/`
    *   例: `CSharp/Projects/ConsoleApp/`
    *   例: `JavaScript/Projects/WebApp/`
    *   例: `Python/Projects/DataAnalysis/`
*   **推奨**: 各プロジェクトディレクトリには、その目的、使用技術、ビルド方法などを記述した `README.md` を含めることを推奨します。また、各言語の `Projects/` ディレクトリ直下には、プロジェクト一覧を表示するための `index.html` ファイルを配置することを推奨します。

### 4. 構造の維持と更新

*   **一貫性**: 新しいトピックやプロジェクトを追加する際は、この構造の一貫性を保つように心がけてください。
*   **`readme.md` の更新**: このディレクトリ構造自体に変更を加える場合は、この `readme.md` ファイルも忘れずに更新し、最新の状態を反映させてください。

### ステップバイステップの説明

1.  `readme.md` ファイルを更新し、C#、JavaScript、Pythonの`Notes`ディレクトリ内に、さらに詳細なサブディレクトリ構造を追加します。

### [readme.md](vscode-remote://wsl/home/Owner/vscode/kztmrngs.github.io/Programming/readme.md)

C#、JavaScript、Pythonの`Notes`ディレクトリにサブディレクトリを追加します。