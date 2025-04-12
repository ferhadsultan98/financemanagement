.layout {
  display: flex;
  min-height: 100vh; // Ensure the layout takes full viewport height
  width: 100%;
  overflow-x: hidden; // Prevent horizontal scroll issues

  .main-content {
    flex: 1; // Take remaining space
    width: 100%; // Ensure it spans the available width
    padding: 20px; // Add padding for content breathing room
    box-sizing: border-box; // Prevent padding from causing overflow
    overflow-y: auto; // Allow scrolling for long content
  }

  // Desktop and larger screens (sidebar visible by default)
  @media (min-width: 769px) {
    .main-content {
      margin-left: 300px; // Adjust based on sidebar width
    }
  }

  // Tablets and smaller screens
  @media (max-width: 768px) {
    flex-direction: column; // Stack sidebar and content vertically
    .main-content {
      margin-left: 0; // Remove sidebar offset
      padding: 15px; // Slightly reduce padding for smaller screens
    }
  }

  // Mobile screens
  @media (max-width: 480px) {
    .main-content {
      padding: 10px; // Further reduce padding for very small screens
    }
  }
}