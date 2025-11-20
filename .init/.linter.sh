#!/bin/bash
cd /home/kavia/workspace/code-generation/career-navigator-platform-44326-44350/career_navigation_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

