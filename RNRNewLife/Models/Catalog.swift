import Foundation

/// The whole library as shipped in `Catalog.json`.
struct Catalog: Codable, Equatable {
    let missionName: String
    let tagline: String
    let websiteURL: URL
    let contactEmail: String
    let about: String
    let publications: [Publication]

    static let empty = Catalog(
        missionName: "R&R New Life",
        tagline: "",
        websiteURL: URL(string: "https://rnrnewlife.com")!,
        contactEmail: "",
        about: "",
        publications: []
    )

    static func decode(from data: Data) throws -> Catalog {
        try JSONDecoder().decode(Catalog.self, from: data)
    }
}
