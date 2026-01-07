
#include "pch.h"
#include "framework.h"
#include "WrapperExtension.h"

//////////////////////////////////////////////////////
// Boilerplate stuff - don't change
WrapperExtension* g_Extension = nullptr;

// Main DLL export function to initialize extension.
extern "C" {
	__declspec(dllexport) IExtension* WrapperExtInit(IApplication* iApplication)
	{
		g_Extension = new WrapperExtension(iApplication);
		return g_Extension;
	}
}

// Helper method to call HandleWebMessage() with more useful types, as OnWebMessage() must deal with
// plain-old-data types for crossing a DLL boundary.
void WrapperExtension::OnWebMessage(LPCSTR messageId_, size_t paramCount, const ExtensionParameterPOD* paramArr, double asyncId)
{
	HandleWebMessage(messageId_, UnpackExtensionParameterArray(paramCount, paramArr), asyncId);
}

// Helper method to call iApplication->SendWebMessage() with more useful types, as the interface must deal with
// plain-old-data types for crossing a DLL boundary.
void WrapperExtension::SendWebMessage(const std::string& messageId, const std::map<std::string, ExtensionParameter>& params, double asyncId)
{
	std::vector<NamedExtensionParameterPOD> paramArr = PackNamedExtensionParameters(params);
	iApplication->SendWebMessage(messageId.c_str(), paramArr.size(), paramArr.empty() ? nullptr : paramArr.data(), asyncId);
}

// Helper method for sending a response to an async message (when asyncId is not -1.0).
// In this case the message ID is not used, so this just calls SendWebMessage() with an empty message ID.
void WrapperExtension::SendAsyncResponse(const std::map<std::string, ExtensionParameter>& params, double asyncId)
{
	SendWebMessage("", params, asyncId);
}

//////////////////////////////////////////////////////
// Custom implementation for your wrapper extension
WrapperExtension::WrapperExtension(IApplication* iApplication_)
	: iApplication(iApplication_),
	  hWndMain(NULL)
{
	// Tell the host application the SDK version used. Don't change this.
	iApplication->SetSdkVersion(WRAPPER_EXT_SDK_VERSION);

	// Register a component ID for JavaScript messaging with this extension.
	// The Construct plugin must specify the same component ID via SetWrapperExtensionComponentId().
	// Extensions should only register a single component ID, and it must be different to all other component
	// IDs that are ever used, so make sure it's unique. It should also only be registered here
	// in the WrapperExtension constructor.
	iApplication->RegisterComponentId("MY_ADDON_ID");
}

void WrapperExtension::Init()
{
	// Called during startup after all other extensions have been loaded.
}

void WrapperExtension::Release()
{
	// Called during application exit to allow your extension to release any resources it was using.
}

void WrapperExtension::OnMainWindowCreated(HWND hWnd)
{
	// Called during startup when the main window is created.
	// The HWND is saved in case it's needed later on.
	hWndMain = hWnd;
}

// For handling a message sent from JavaScript, sent via either SendWrapperExtensionMessage()
// or SendWrapperExtensionMessageAsync(). The async variant sets 'asyncId' and will expect a response
// sent via SendAsyncResponse() specifying the same 'asyncId', which will resolve the JavaScript promise.
// Both sides must have set the same component ID for messaging to work.
void WrapperExtension::HandleWebMessage(const std::string& messageId, const std::vector<ExtensionParameter>& params, double asyncId)
{
	if (messageId == "sample")
	{
		SampleAction();
	}
}

void WrapperExtension::SampleAction()
{
	// This is an example action that can be triggered from JavaScript.
	// You can use the iApplication pointer to access the host application
	// and perform actions like opening dialogs, showing notifications, etc.
	
	// For example, show a message box:
	MessageBox(hWndMain, "Sample action executed!", "Wrapper Extension", MB_OK);
	
	// If you want to send a response back to JavaScript, you can do so here.
	// SendAsyncResponse({ {"result", ExtensionParameter("success")} }, asyncId);
}
