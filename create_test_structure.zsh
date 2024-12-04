#!/bin/zsh

# Remove existing test directory if it exists
rm -rf src/**tests**
rm -rf src/__tests__

# Create main test directory and subdirectories
mkdir -p src/__tests__/{frontend,backend,db,ml,integration}

# Create frontend test files
touch src/__tests__/frontend/AudioPlayer.test.tsx
touch src/__tests__/frontend/UserVoice.test.tsx

# Create backend test files
touch src/__tests__/backend/routes.test.ts
touch src/__tests__/backend/controllers.test.ts

# Create db test files
touch src/__tests__/db/supabase.test.ts
touch src/__tests__/db/queries.test.ts

# Create ml test files
touch src/__tests__/ml/service.test.ts
touch src/__tests__/ml/processing.test.ts

# Create integration test files
touch src/__tests__/integration/uploadFlow.test.ts
touch src/__tests__/integration/mlPipeline.test.ts

# Create setup file
touch src/__tests__/setup.ts

# Echo completion and show structure
echo "\nTest directory structure created!"
echo "\nStructure:"
tree src/__tests__
