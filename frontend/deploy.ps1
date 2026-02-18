# Deploy to GitHub Pages script

# Ensure strict error handling
$ErrorActionPreference = "Stop"

# Store the script's directory
$ScriptDir = $PSScriptRoot
Write-Host "Script running in: $ScriptDir"

# Navigate to the frontend directory
Set-Location $ScriptDir

# Build the project
Write-Host "Building project..."
try {
    npm run build
} catch {
    Write-Error "Build failed. Please check the error messages above."
    exit 1
}

# Check if dist exists
if (-not (Test-Path "dist")) {
    Write-Error "Build directory 'dist' not found. Build might have failed."
    exit 1
}

# Navigate to the build output directory
Set-Location dist

# Initialize a new git repository
# Note: We re-initialize inside dist to create a fresh repo for deployment
if (-not (Test-Path ".git")) {
    git init
}
git checkout -b gh-pages

# Add all files
git add -A

# Commit
git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Push to the verified repo url
Write-Host "Pushing to GitHub..."
# Check if remote exists, if not add it
$remotes = git remote
if ($remotes -notcontains "origin") {
    git remote add origin https://github.com/chuanusa/GH02Day.git
} else {
    git remote set-url origin https://github.com/chuanusa/GH02Day.git
}

git push -f origin gh-pages

# Cleanup: Navigate back to original directory
Set-Location $ScriptDir
Write-Host "Deployment complete!"
