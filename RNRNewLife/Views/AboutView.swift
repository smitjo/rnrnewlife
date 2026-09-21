import SwiftUI

struct AboutView: View {
    @EnvironmentObject private var store: ContentStore

    var body: some View {
        NavigationStack {
            List {
                Section("About") {
                    Text(store.content.about)
                }
                Section("Get in touch") {
                    Link(destination: store.content.websiteURL) {
                        Label(store.content.websiteURL.host() ?? "Website", systemImage: "safari")
                    }
                    if !store.content.contactEmail.isEmpty,
                       let mailto = URL(string: "mailto:\(store.content.contactEmail)") {
                        Link(destination: mailto) {
                            Label(store.content.contactEmail, systemImage: "envelope")
                        }
                    }
                }
            }
            .navigationTitle("About")
        }
    }
}

#Preview {
    AboutView().environmentObject(ContentStore.preview)
}
