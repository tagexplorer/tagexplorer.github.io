import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/help')({
  component: Help,
  head: () => ({
    meta: [{ title: 'Help - tagexplorer' }],
  }),
})

function Help() {
  return (
    <div className="px-5 py-3 bg">
      <div className="flex flex-col px-4 py-5 my-5 text-sm rounded-lg subtle-bg custom-shadow-md gap-3">
        <h2 className="text-lg font-bold">Help</h2>
        <ul className="flex flex-col pl-5 list-disc gap-3">
          <li>
            Artist gens were made with Anima and Illustrious (pick one via the "Model" option).
            Non-artists gen on this site rere made with Illustrious 1.1, and are also applicable to
            Anima.
          </li>
          <li>
            For full generation settings, gens on the Heads, Styles, and Composition pages contain
            ComfyUI workflows.
          </li>
          <li>
            Artist gens don't contain workflows because they were compressed to save storage and
            bandwidth. You can download this{' '}
            <a target="_blank" className="underline" href="/gens/sample_artist_workflow.png">
              sample w orkflow
            </a>{' '}
            for reference. The only difference between gens is the artist tag.
          </li>
          <li>
            The artist list is not exhaustive. It consists of 18451 artists with at least 100 posts
            on Danbooru. 385 unsupported artists were removed from the imageset by an automated
            visual similarity comparison. Artist tag support is checkpoint-dependent. Some "weak"
            artist tags might reveal their potential with higher tag weight.
          </li>
          <li>
            The Anima artist list consists of 35959 artists with at least 50 posts on Danbooru.
          </li>
          <li>
            "Ineffective" tags were manually marked as such if they seemed to not have the intended
            effect (medium strictly interpreted as an object, composition changed in ways irrelevant
            to the tag, etc.). Take them with a grain of salt: results will vary with checkpoints,
            tag weight, prompt, and seed.
          </li>
          <li>
            If you want to browse the imageset locally or otherwise process it in any way you'd
            like, you can clone or download the{' '}
            <a
              target="_blank"
              className="underline"
              href="https://github.com/tagexplorer/tagexplorer.github.io"
            >
              GitHub repository
            </a>
            .
          </li>
          <li>
            If you would like to report an issue or suggest a feature, please use the{' '}
            <a
              target="_blank"
              className="underline"
              href="https://github.com/tagexplorer/tagexplorer.github.io/issues"
            >
              GitHub issue tracker
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  )
}
