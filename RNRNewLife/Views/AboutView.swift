import SwiftUI

struct AboutView: View {
    @EnvironmentObject private var library: LibraryStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(library.catalog.missionName).font(.title2.bold())
                        Text(library.catalog.tagline)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section("About") {
                    Text(library.catalog.about)
                }

                Section("Get in touch") {
                    Link(destination: library.catalog.websiteURL) {
                        Label(library.catalog.websiteURL.host() ?? "Website", systemImage: "safari")
                    }
                    if !library.catalog.contactEmail.isEmpty,
                       let mailto = URL(string: "mailto:\(library.catalog.contactEmail)") {
                        Link(destination: mailto) {
                            Label(library.catalog.contactEmail, systemImage: "envelope")
                        }
                    }
                }
            }
            .navigationTitle("About")
        }
    }
}

#Preview {
    AboutView().environmentObject(LibraryStore.preview)
}
