import SwiftUI

struct ReaderView: View {
    @EnvironmentObject private var readingList: ReadingListStore
    @AppStorage("reader.fontSize") private var fontSize: Double = 18

    let publication: Publication
    let chapter: Chapter

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(chapter.title)
                    .font(.system(size: fontSize + 8, weight: .bold, design: .serif))

                ForEach(chapter.paragraphs.indices, id: \.self) { index in
                    Text(chapter.paragraphs[index])
                        .font(.system(size: fontSize, design: .serif))
                        .lineSpacing(fontSize * 0.35)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
        }
        .navigationTitle(publication.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button("Larger text", systemImage: "textformat.size.larger") {
                        fontSize = min(fontSize + 2, 32)
                    }
                    Button("Smaller text", systemImage: "textformat.size.smaller") {
                        fontSize = max(fontSize - 2, 14)
                    }
                } label: {
                    Label("Text size", systemImage: "textformat.size")
                }
            }
        }
        .onAppear {
            readingList.recordOpened(chapterID: chapter.id, in: publication.id)
        }
    }
}
